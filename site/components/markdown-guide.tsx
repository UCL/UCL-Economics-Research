import type { ReactNode } from 'react';
import { ResearchComputingPage } from '@/components/research-computing-page';

const inlineHtml = (source: string) => source
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>');

const Inline = ({ children }: { children: string }) => <span dangerouslySetInnerHTML={{ __html: inlineHtml(children) }} />;

function renderMarkdown(source: string) {
  const lines = source.replaceAll('\r\n', '\n').split('\n');
  const blocks: ReactNode[] = [];
  let index = lines[0]?.startsWith('# ') ? 1 : 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }

    if (line.startsWith('```')) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith('```')) code.push(lines[index++]);
      index += 1;
      blocks.push(<pre key={`code-${index}`}><code>{code.join('\n')}</code></pre>);
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      const Heading = heading[1].length === 2 ? 'h3' : 'h4';
      blocks.push(<Heading key={`heading-${index}`}><Inline>{heading[2]}</Inline></Heading>);
      index += 1;
      continue;
    }

    if (line.startsWith('>')) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].startsWith('>')) quote.push(lines[index++].replace(/^>\s?/, ''));
      blocks.push(<blockquote key={`quote-${index}`}><Inline>{quote.join(' ')}</Inline></blockquote>);
      continue;
    }

    if (/^- /.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^- /.test(lines[index])) items.push(lines[index++].replace(/^- /, '').replace(/^\[[ x]\]\s*/, ''));
      blocks.push(<ul key={`list-${index}`}>{items.map((item, itemIndex) => <li key={itemIndex}><Inline>{item}</Inline></li>)}</ul>);
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\. /.test(lines[index])) items.push(lines[index++].replace(/^\d+\. /, ''));
      blocks.push(<ol key={`list-${index}`}>{items.map((item, itemIndex) => <li key={itemIndex}><Inline>{item}</Inline></li>)}</ol>);
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^(#{2,4})\s|^```|^>|^- |^\d+\. /.test(lines[index])) paragraph.push(lines[index++]);
    blocks.push(<p key={`paragraph-${index}`}><Inline>{paragraph.join(' ')}</Inline></p>);
  }

  return blocks;
}

export function MarkdownGuide({ source, heading }: { source: string; heading: string }) {
  return (
    <ResearchComputingPage active="Clusters" heading={heading}>
      <article className="research-computing-guide">{renderMarkdown(source)}</article>
    </ResearchComputingPage>
  );
}
