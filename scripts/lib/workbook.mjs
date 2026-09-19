import ExcelJS from 'exceljs';
import fs from 'node:fs/promises';
import JSZip from 'jszip';

function colour(value) {
  if (!value) return undefined;
  const hex = String(value).replace(/^#/, '').toUpperCase();
  return { argb: hex.length === 6 ? `FF${hex}` : hex };
}

function columnNumber(letters) {
  return [...letters.toUpperCase()].reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0);
}

function parseCell(reference) {
  const match = String(reference).match(/^\$?([A-Z]+)\$?(\d+)$/i);
  if (!match) throw new Error(`Invalid cell reference: ${reference}`);
  return { row: Number(match[2]), column: columnNumber(match[1]) };
}

function parseRange(reference) {
  const [startText, endText = startText] = String(reference).split(':');
  return { start: parseCell(startText), end: parseCell(endText) };
}

function plainValue(value) {
  if (value == null) return null;
  if (value instanceof Date || typeof value !== 'object') return value;
  if ('result' in value) return plainValue(value.result);
  if ('text' in value) return value.text;
  if (Array.isArray(value.richText)) return value.richText.map((part) => part.text || '').join('');
  return String(value);
}

class Format {
  constructor(range) { this.range = range; }
  set fill(value) { this.range.eachCell((cell) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: colour(value) }; }); }
  set font(value) { this.range.eachCell((cell) => { cell.font = { ...(cell.font || {}), ...value, ...(value.color ? { color: colour(value.color) } : {}) }; }); }
  set horizontalAlignment(value) { this.range.eachCell((cell) => { cell.alignment = { ...(cell.alignment || {}), horizontal: String(value).toLowerCase() }; }); }
  set verticalAlignment(value) { this.range.eachCell((cell) => { cell.alignment = { ...(cell.alignment || {}), vertical: String(value).toLowerCase() }; }); }
  set wrapText(value) { this.range.eachCell((cell) => { cell.alignment = { ...(cell.alignment || {}), wrapText: Boolean(value) }; }); }
  set rowHeight(value) { this.range.eachRow((row) => { row.height = Number(value) * 0.75; }); }
  set rowHeightPx(value) { this.rowHeight = value; }
  set columnWidthPx(value) { this.range.eachColumn((column) => { column.width = Number(value) / 7; }); }
  set borders(value) {
    const border = value?.insideHorizontal;
    if (!border) return;
    this.range.eachCell((cell, row) => {
      if (row < this.range.end.row) cell.border = { ...(cell.border || {}), bottom: { style: border.style, color: colour(border.color) } };
    });
  }
  autofitRows() {}
}

class Range {
  constructor(sheet, start, end) {
    this.sheet = sheet;
    this.start = start;
    this.end = end;
    this._format = new Format(this);
    this.conditionalFormats = {
      add: (type, options = {}) => this.addConditionalFormat(type, options),
      addCustom: (formula, options = {}) => this.addConditionalFormat('expression', { ...options, formula }),
    };
  }
  get rowCount() { return this.end.row - this.start.row + 1; }
  get columnCount() { return this.end.column - this.start.column + 1; }
  get format() { return this._format; }
  set format(value) { for (const [key, setting] of Object.entries(value || {})) this._format[key] = setting; }
  eachCell(callback) {
    for (let row = this.start.row; row <= this.end.row; row++) for (let column = this.start.column; column <= this.end.column; column++) callback(this.sheet.raw.getCell(row, column), row, column);
  }
  eachRow(callback) { for (let row = this.start.row; row <= this.end.row; row++) callback(this.sheet.raw.getRow(row)); }
  eachColumn(callback) { for (let column = this.start.column; column <= this.end.column; column++) callback(this.sheet.raw.getColumn(column)); }
  get values() {
    const rows = [];
    for (let row = this.start.row; row <= this.end.row; row++) {
      const values = [];
      for (let column = this.start.column; column <= this.end.column; column++) values.push(plainValue(this.sheet.raw.getCell(row, column).value));
      rows.push(values);
    }
    return rows;
  }
  set values(rows) {
    rows.forEach((values, rowOffset) => values.forEach((value, columnOffset) => {
      this.sheet.raw.getCell(this.start.row + rowOffset, this.start.column + columnOffset).value = value;
    }));
  }
  getRow(index) { return new Range(this.sheet, { row: this.start.row + index, column: this.start.column }, { row: this.start.row + index, column: this.end.column }); }
  getRangeByIndexes(row, column, rowCount, columnCount) {
    return new Range(this.sheet, { row: this.start.row + row, column: this.start.column + column }, { row: this.start.row + row + rowCount - 1, column: this.start.column + column + columnCount - 1 });
  }
  addConditionalFormat(type, options) {
    const fill = options.fill || options.format?.fill;
    const style = fill ? { fill: { type: 'pattern', pattern: 'solid', bgColor: colour(fill) } } : {};
    const formula = options.formula || (type === 'containsBlanks' ? `LEN(TRIM(${this.sheet.raw.getCell(this.start.row, this.start.column).address}))=0` : type === 'containsText' ? `NOT(ISERROR(SEARCH("${String(options.text || '').replaceAll('"', '""')}",${this.sheet.raw.getCell(this.start.row, this.start.column).address})))` : 'TRUE');
    this.sheet.raw.addConditionalFormatting({ ref: `${this.sheet.raw.getCell(this.start.row, this.start.column).address}:${this.sheet.raw.getCell(this.end.row, this.end.column).address}`, rules: [{ type: 'expression', formulae: [formula.replace(/^=/, '')], style }] });
  }
  setNumberFormat(format) { this.eachCell((cell) => { cell.numFmt = format; }); }
  set dataValidation(value) {
    const values = value?.rule?.values || [];
    const escaped = values.map((entry) => String(entry).replaceAll('"', '""')).join(',');
    this.eachCell((cell) => { cell.dataValidation = { type: 'list', allowBlank: true, formulae: [`"${escaped}"`] }; });
  }
}

class Table {
  constructor(raw) { this.raw = raw; }
  set style(value) { this.raw.style = { ...(this.raw.style || {}), theme: value }; }
  set showBandedRows(value) { this.raw.style = { ...(this.raw.style || {}), showRowStripes: Boolean(value) }; }
}

class Worksheet {
  constructor(raw) {
    this.raw = raw;
    this.freezePanes = { freezeRows: (count) => this.updateView({ state: 'frozen', ySplit: count }) };
    this.tables = { add: (reference, hasHeaders, name) => this.addTable(reference, hasHeaders, name) };
  }
  updateView(change) { this.raw.views = [{ ...(this.raw.views[0] || {}), ...change }]; }
  set showGridLines(value) { this.updateView({ showGridLines: Boolean(value) }); }
  getRange(reference) { const bounds = parseRange(reference); return new Range(this, bounds.start, bounds.end); }
  getRangeByIndexes(row, column, rowCount, columnCount) { return new Range(this, { row: row + 1, column: column + 1 }, { row: row + rowCount, column: column + columnCount }); }
  getCell(row, column) { return new Range(this, { row: row + 1, column: column + 1 }, { row: row + 1, column: column + 1 }); }
  getUsedRange() {
    const rowCount = Math.max(this.raw.actualRowCount, 1);
    const columnCount = Math.max(this.raw.actualColumnCount, 1);
    return new Range(this, { row: 1, column: 1 }, { row: rowCount, column: columnCount });
  }
  addTable(reference, hasHeaders, name) {
    const bounds = parseRange(reference);
    const values = new Range(this, bounds.start, bounds.end).values;
    const headers = values[0] || [];
    const raw = this.raw.addTable({
      name,
      ref: reference.split(':')[0],
      headerRow: Boolean(hasHeaders),
      columns: headers.map((header, index) => ({ name: String(header || `Column${index + 1}`) })),
      rows: values.slice(hasHeaders ? 1 : 0),
      style: { theme: 'TableStyleMedium2', showRowStripes: true },
    });
    return new Table(raw);
  }
}

class WorkbookAdapter {
  constructor(raw = new ExcelJS.Workbook()) {
    this.raw = raw;
    this.worksheets = {
      add: (name) => new Worksheet(this.raw.addWorksheet(name)),
      getItem: (name) => {
        const sheet = this.raw.getWorksheet(name);
        if (!sheet) throw new Error(`Worksheet not found: ${name}`);
        return new Worksheet(sheet);
      },
    };
  }
  async inspect(options = {}) {
    if (options.kind === 'match') {
      const regex = new RegExp(options.searchTerm || '', options.options?.useRegex ? 'i' : 'i');
      const matches = [];
      const limit = options.options?.maxResults || 100;
      for (const sheet of this.raw.worksheets) sheet.eachRow({ includeEmpty: false }, (row) => row.eachCell({ includeEmpty: false }, (cell) => {
        if (matches.length < limit && regex.test(String(plainValue(cell.value) ?? ''))) matches.push({ sheet: sheet.name, address: cell.address, value: plainValue(cell.value) });
      }));
      return { ndjson: matches.map((match) => JSON.stringify(match)).join('\n') };
    }
    const [sheetName, reference] = String(options.range || '').includes('!') ? String(options.range).split('!') : [this.raw.worksheets[0]?.name, options.range];
    const values = this.worksheets.getItem(sheetName).getRange(reference).values.slice(0, options.tableMaxRows || Infinity).map((row) => row.slice(0, options.tableMaxCols || Infinity));
    return { ndjson: values.map((row) => JSON.stringify(row)).join('\n') };
  }
  async render() {
    console.warn('Workbook preview skipped: ExcelJS does not render worksheets to PNG.');
    return null;
  }
}

export class Workbook {
  static create() { return new WorkbookAdapter(); }
}

export class FileBlob {
  static async load(filePath) { return { path: filePath }; }
}

export class SpreadsheetFile {
  static async importXlsx(blob) {
    const raw = new ExcelJS.Workbook();
    try {
      await raw.xlsx.readFile(blob.path);
    } catch (error) {
      const zip = await JSZip.loadAsync(await fs.readFile(blob.path));
      const contentTypesFile = zip.file('[Content_Types].xml');
      if (!contentTypesFile) throw error;
      let contentTypes = await contentTypesFile.async('string');
      if (!contentTypes.includes('PartName="/xl/workbook.xml"')) {
        contentTypes = contentTypes
          .replace('ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"', 'ContentType="application/xml"')
          .replace('</Types>', '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" /></Types>');
        zip.file('[Content_Types].xml', contentTypes);
        for (const [name, entry] of Object.entries(zip.files)) {
          if (!entry.dir && name.startsWith('xl/') && name.endsWith('.xml')) {
            const xml = await entry.async('string');
            zip.file(name, xml.replaceAll('<x:', '<').replaceAll('</x:', '</'));
          }
          if (!entry.dir && name.endsWith('.rels')) {
            let relationships = await entry.async('string');
            if (name === 'xl/_rels/workbook.xml.rels') relationships = relationships.replaceAll('Target="/xl/', 'Target="');
            if (name.startsWith('xl/worksheets/_rels/')) relationships = relationships.replaceAll('Target="/xl/', 'Target="../');
            zip.file(name, relationships);
          }
        }
        await raw.xlsx.load(await zip.generateAsync({ type: 'nodebuffer' }));
      } else {
        throw error;
      }
    }
    return new WorkbookAdapter(raw);
  }
  static async exportXlsx(workbook) {
    return { save: async (filePath) => workbook.raw.xlsx.writeFile(filePath) };
  }
}
