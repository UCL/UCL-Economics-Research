# UCL Economics Research webpages

This repository will contain the source, content, and update processes for a set
of UCL Economics Research webpages. The initial aim is to produce clear,
accessible pages that can be kept current from agreed online sources or
spreadsheets without unnecessary manual editing.

## Planned pages

1. **Seminars**
2. **Visitors**
3. **Events**
4. **Research Groups**
5. **Publications**
6. **PhD Students**

The Research Groups, Publications, and PhD Students pages are currently works
in progress. Their content and update processes will be defined later.

## Governance

- **Project owner:** Professor Lars Nesheim (`l.nesheim@ucl.ac.uk`)
- **Publication approver:** Professor Lars Nesheim
- **Editors:** To be appointed
- **Reviewers:** To be appointed
- **Seminar content owners:** To be appointed for each seminar series
- **Visitors content owner:** Professor Lars Nesheim
- **Events content owner:** Professor Lars Nesheim

Each imported or manually edited asset must be approved by its relevant content
owner or, where no separate owner has been appointed, by the project owner.

## Seminars

The Seminars page will have an **All seminars** tab followed by eight series
tabs:

- All seminars
- Applied Economics
- Econometrics
- Economic Theory
- Finance
- Macroeconomics
- IFS Seminar
- IFS/UCL/LSE Development Seminar
- IFS/UCL Labour Seminar

The IFS schedule is imported from the IFS seminars webpage. Rows labelled
CeMMAP on that page are excluded because the same programme is already supplied
by the dedicated CeMMAP source.

Seminar information will be refreshed daily. Each series may be populated from
either an approved online source or a spreadsheet placed in the `seminars/`
folder. The owner of each seminar series is still to be appointed.

### Seminar page requirements

Selecting a seminar-series tab will show a clean, simple page containing:

1. a prominent summary of that series' next upcoming seminar;
2. a complete table of seminars in the current academic term; and
3. the seminar organisers' names and email addresses.

The **All seminars** tab shows every seminar scheduled across all series in the
selected Monday-to-Sunday week. It opens on the current week and provides
previous- and next-week arrow buttons. When either button has focus, the Left
and Right arrow keys also move backward and forward by one week. The displayed
date range is announced when it changes, and a clear empty state is shown when
the selected week contains no seminars.

The term table will use the columns **Date**, **Speaker**, **Title**,
**Location**, and **Time**. It will follow these display rules:

- The Speaker cell displays the speaker's name, with their institution on a
  second line. The name links to the speaker's webpage when a URL is available;
  otherwise it is plain text.
- The Title cell links to the paper or slides when a URL is available;
  otherwise it is plain text. A missing title is displayed as **TBA**.
- Location and time are displayed separately. A location URL, where available,
  is used in the featured next-seminar summary.
- The table contains the complete current-term schedule, including seminars
  that have already taken place; the next upcoming seminar is visually
  identified without obscuring the full list.

The next-seminar summary repeats the date, linked speaker name, institution,
linked paper or slides title, linked location, and time, using the same fallback
rules as the table. It also includes a **Sign up to meet the speaker** link to
the relevant entry on a separate sign-up-list page. The sign-up list and any
personal information it collects must have appropriate access and privacy
controls.

Required seminar data fields are therefore:

- seminar series
- academic year and academic term
- date and start/end time
- speaker name and institution
- optional speaker webpage URL
- optional title (displayed as **TBA** when absent)
- optional paper or slides URL
- location and optional location URL
- optional sign-up-list URL
- organiser name and email address
- status, including scheduled, cancelled, or postponed
- source and last-updated date

The editable standard seminar spreadsheet contains only **Date**, **Speaker**,
**Institution**, **Speaker URL**, **Title**, **Paper URL**, and **Status**.
Missing cells are highlighted in yellow for review. Recurring location and time
defaults, plus annual organiser details, are stored once in
`seminars/config/series.json`; sign-up URLs are managed separately and are not
part of the standard schedule spreadsheet.

## Visitors and events

The Visitors page is maintained from `visitors/visitors-2026-27.xlsx`. Its
fields are name, institution, webpage, start date, end date, optional date
display text, office, and optional email. The separate date-display field is
used only when exact dates are not yet known.

The Events page follows the same pattern using
`events/events-2026-27.xlsx`. Its fields are event type, title, event URL, date
display, optional exact start and end dates, location and location URL,
organisers, and booking URL. Multiple organisers are separated with semicolons.

After either workbook is edited, `scripts/sync_spreadsheets_to_site.mjs`
creates the website-ready visitor and event data. The workbooks are the
manually maintained source; files under `site/data/` are generated copies for
the website. Both content sources are owned by Professor Lars Nesheim.

## Publication period and archive

The public pages will initially show only the 2026–27 academic year. The system
should be designed to retain earlier academic years in a private archive in the
future, but archived records will not be published unless that policy changes.

## Proposed repository structure

```text
.
├── README.md
├── task_list.md
├── seminars/        # Seminar spreadsheets and source documentation
├── visitors/        # Visitor spreadsheets and source documentation
├── events/          # Event spreadsheets and source documentation
├── site/            # Website source (to be confirmed)
├── scripts/         # Data import and validation tools
└── tests/           # Automated checks
```

Folders will be added as the relevant work begins. Raw source data should be
kept separate from generated website files.

## Hosting and recommended technology

The webpages will initially be external to the existing UCL website and hosted
on a Google platform. The exact platform name and the availability of an
approved UCL-managed Google project must still be confirmed.

The recommended implementation is:

- **Eleventy (11ty)** to generate a small static website from templates and
  validated data;
- **HTML, CSS, and minimal JavaScript** for fast, robust, accessible pages;
- **Firebase Hosting** for Google-hosted deployment, HTTPS, preview channels,
  custom-domain support, and rollback;
- **Google Sheets or versioned spreadsheet files** as editor-friendly inputs;
- **a scheduled import and build workflow** to check sources daily, validate
  changes, create a preview, and publish only after owner approval.

This is preferable to building the main pages directly in Google Sites because
the project needs reliable data imports, accessible interactive seminar tabs,
automated validation, versioned review, testing, and future private archives.
If Google Sites is mandatory, it can instead act as a simple outer site with a
full-page embed, but the embedded application would still need separate hosting
and governance. No confidential archive data should be included in the public
site build or its downloadable assets.

## Update approach

The intended content pipeline is:

```text
approved link or spreadsheet → import → validation → review → webpage
```

Every source should have a named owner and a documented format. Initial sources
will be checked daily. Imports should report missing or malformed data rather
than silently publishing it. Generated pages should show when their content was
last updated, and the relevant content owner or project owner must approve
changes before publication.

Spreadsheets must not contain confidential personal data. Contact details and
other personal information should only be published where there is a clear
purpose and appropriate permission.

## Design and content principles

- Follow UCL visual identity guidance and agree the relationship to the main UCL
  website before implementation. The initial visual reference is the UCL
  Economics website: <https://www.ucl.ac.uk/social-historical-sciences/economics>.
- Order the primary navigation by user need rather than alphabetically:
  time-sensitive and frequently used pages first; research outputs next; people
  pages next; and institutional and reference pages last. Within each group,
  place the page with the broader or more frequent use first. Keep the order
  stable unless evidence from usage or user research supports changing it.
- Design mobile-first and meet WCAG 2.2 AA accessibility requirements.
- Use semantic HTML, keyboard-accessible navigation, useful page titles, and
  descriptive link text.
- Make upcoming information prominent and retain past items only where useful.
- Keep source attribution, ownership, and update status visible to editors.
- Avoid committing credentials, private data, or unpublished sensitive content.

## Project status

The project is at the discovery and prototyping stage. The first deliverable is
a small set of model webpages showing proposed visual style, navigation, and
representative content. These models will be reviewed before the recommended
technical stack and full data pipeline are finalised.

See [task_list.md](task_list.md) for the proposed work plan.
