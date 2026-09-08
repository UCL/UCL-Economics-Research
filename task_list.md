# Task list

This is the working backlog for the UCL Economics Research website. The current
priority is to make the prototype accessible to colleagues for structured
review. Completed prototype work is recorded below; unchecked items are the
remaining tasks.

## Current status — 8 September 2026

- [x] Build a responsive UCL-inspired website prototype.
- [x] Add top-level pages for Seminars, Visitors, Events, People,
  Publications, Computing, Resources, Data, and Academic Partners.
- [x] Add placeholder pages for Computing, Data, and Academic Partners.
- [x] Add compact page titles, navigation, footer, desktop layouts, and mobile
  layouts.
- [x] Store the source and generated files in the UCL GitHub repository.
- [x] Publish a shared GitHub Pages review version that colleagues can access
  without using the local development server.
- [ ] Appoint editors and reviewers.
- [ ] Complete stakeholder review and record decisions.
- [ ] Obtain approval from Professor Lars Nesheim before public launch.

## Next phase — invite colleagues to review

The reviewer-accessible site is now published with GitHub Pages. Use GitHub
issues as the authoritative record of comments, decisions, and completed
changes. Email may be used to invite reviewers and receive comments, but
actionable feedback should be transferred into GitHub issues.

### Immediate tasks

- [ ] Draft an email inviting colleagues to review the website. Include the
  review URL, deadline, scope, known limitations, and instructions for sending
  comments or creating GitHub issues.
- [ ] Decide whether reviewers should create issues directly or send comments
  by email for the project owner to enter into GitHub.
- [ ] Identify and invite the first group of colleagues, including at least one
  reviewer for content, design/usability, accessibility, and data accuracy.
- [ ] Create a main GitHub issue for the review round and include the review
  URL, deadline, scope, and named approver.
- [ ] Test the published site in a private browser window and on a phone before
  sending the invitation.
- [ ] Create a spreadsheet for each seminar-organiser group using the standard
  columns: Date, Speaker, Institution, Speaker URL, Title, Paper URL, Status,
  Special start time, Special end time, and Special location.
- [ ] Highlight missing required information in yellow and explain the series
  defaults, overrides, source, owner, and return process in each spreadsheet.
- [ ] Send each spreadsheet to the relevant seminar organisers for completion
  and confirmation.

### Email-to-issue workflow

- [ ] Define a standard format for email review requests: page or URL,
  problem, requested change, priority, and optional screenshot.
- [ ] Begin with a manual process for converting actionable emails into GitHub
  issues, retaining a link or reference to the original message.
- [ ] Confirm UCL information-governance and account-permission requirements
  before connecting an email inbox to an automated process.
- [ ] Prototype automation that extracts proposed issue title, page, requested
  change, sender, and attachments from review emails.
- [ ] Require human confirmation before an extracted request creates or edits a
  GitHub issue.
- [ ] Test duplicate detection, personal-data handling, malformed emails, and
  attachment handling before enabling the automation.

### What comes next

- [ ] Triage the first review round into corrections, enhancements, decisions,
  and out-of-scope requests; assign an owner and target date to each issue.
- [ ] Complete missing seminar, visitor, and event information and have each
  asset owner approve their records.
- [ ] Reconcile and quality-check People and Publications data, prioritising
  missing and incorrectly attributed publications.
- [ ] Complete accessibility, mobile, browser, broken-link, and data-validation
  testing.
- [ ] Agree a content freeze and launch acceptance checklist.
- [ ] Resolve launch-blocking issues and obtain final approval from Professor
  Lars Nesheim.
- [ ] Decide whether GitHub Pages remains the production host or whether to
  migrate the approved site to an institutionally owned Firebase project.
- [ ] After the source formats and approval workflow are stable, automate daily
  source checks, validation reports, preview generation, approval, deployment,
  and rollback.

### GitHub review workflow

- [ ] Create one GitHub issue named **Prototype website review**.
- [ ] Put the shared preview URL, review deadline, scope, and named approver in
  the issue description.
- [ ] Ask reviewers to add one comment per problem, stating the page or URL,
  what they observed, and the requested change. Screenshots may be attached
  where useful.
- [ ] Use GitHub issue labels such as `content`, `design`, `data`,
  `accessibility`, `bug`, and `decision-needed`.
- [ ] Convert substantial or separately assignable comments into their own
  issues and link them back to the main review issue.
- [ ] Record the final approval decision in the main review issue before the
  reviewed preview is promoted to the live site.

### Automatic previews after the first review

- [ ] Connect Firebase Hosting to GitHub Actions.
- [ ] Configure each pull request to receive its own Firebase preview URL.
- [ ] Confirm that the workflow comments on each pull request with its preview
  URL and updates that same preview after new commits.
- [ ] Require review of the preview before merging material changes.
- [ ] Keep automatic live deployment disabled until the approval and rollback
  process is agreed.

## Completed prototype pages

### Seminars

- [x] Add an **All seminars** tab showing all seminars in the selected week and
  make it the default view.
- [x] Add previous- and next-week buttons and keyboard support.
- [x] Add Applied Economics, CeMMAP, THEBES, Finance, Macroeconomics, IFS
  Seminar, IFS/UCL/LSE Development, and IFS/UCL Labour tabs.
- [x] Visually group the three external IFS series.
- [x] Add compact next-seminar panels and current-term tables.
- [x] Display institutions, speaker links, paper links, locations, times,
  organiser details, and missing-information fallbacks.
- [x] Create standard seminar workbooks with incomplete fields highlighted.
- [x] Support default series times and locations plus special overrides.
- [x] Import available CeMMAP, THEBES, Macroeconomics, Finance, and IFS data.
- [x] Import the authoritative Applied Economics schedule and retain an offline
  standard-format source file.
- [ ] Confirm owners, organisers, locations, and defaults for every series.
- [ ] Add meet-the-speaker sign-up links when the system and privacy rules are
  ready.

### Visitors

- [x] Create `visitors/visitors-2026-27.xlsx` and make it the page source.
- [x] Add linked names, institutions, combined dates, and offices.
- [x] Add Visitors and Long Term Visitors tabs; define long-term as more than
  three working days.
- [x] Add the supplied long-term and forthcoming visitors.
- [ ] Review dates, offices, permissions, and missing information.

### Events

- [x] Create `events/events-2026-27.xlsx` and make it the page source.
- [x] Add event type, linked title, dates, linked location, organisers, and
  booking link.
- [x] Add the supplied 2026–27 events and Centre for Finance Annual Lecture.
- [ ] Confirm final dates, venues, event URLs, and booking links.

### People and publications

- [x] Create a compact alphabetical People page from the UCL staff list.
- [x] Display name, title, UCL profile, email, personal webpage, and a
  publications link where records are available.
- [x] Create staff publication pages with Journal articles, Working papers, and
  Other tabs.
- [x] Create the research-staff workbook with classifications, contact details,
  biographies, research keywords, teaching, links, identifiers, and status.
- [x] Download 2,835 records from available UCL Profiles into
  `research_staff/publications_ucl_profile.xlsx`.
- [x] Inspect personal webpages for working-paper lists and save review
  candidates in `research_staff/working_papers.xlsx`.
- [x] Use UCL Profiles as the primary publication source and retain OpenAlex
  only for reconciliation and metadata enrichment.
- [x] Limit Recent publications to journal articles and books with field and
  15-year filters.
- [x] Classify a publication using the union of its UCL authors' primary fields.
- [x] Bold UCL authors and display only journal names for journal articles.
- [ ] Review yellow working-paper candidates before publishing them.
- [ ] Resolve staff without a working UCL Profile and add authoritative sources
  for them, including Alessia Testa.
- [ ] Reconcile UCL Profile records with ORCID and OpenAlex by DOI or normalized
  title; never publish unmatched OpenAlex records automatically.
- [ ] Review duplicates, missing dates and links, language rules, and
  publication-type classification.

## Data imports and editorial workflow

- [x] Create editable spreadsheet sources for seminars, visitors, events,
  staff, UCL Profile publications, and personal-site working papers.
- [x] Keep generated website data separate from editable source workbooks.
- [x] Highlight information requiring manual review in yellow where applicable.
- [ ] Document every source URL, named owner, refresh frequency, and approval
  requirement.
- [ ] Validate required fields, dates, URLs, duplicates, and allowed categories
  during every import.
- [ ] Produce a clear validation report when an import is incomplete or fails.
- [ ] Prevent generated pages from exposing formulas, credentials, private
  notes, or unpublished spreadsheet fields.
- [ ] Add automated tests using valid and deliberately invalid source files.
- [ ] Add a manual refresh command for authorised editors.
- [ ] Configure daily source checks only after sources and approvals are stable.
- [ ] Provide a content-change preview before publication.
- [ ] Document rollback, recovery, stale-data, and broken-link procedures.

## Review, accessibility, and launch

- [ ] Test keyboard navigation, focus order, headings, tab semantics,
  descriptive links, and colour contrast against WCAG 2.2 AA.
- [ ] Test representative phone, tablet, and desktop sizes.
- [ ] Test current versions of major browsers.
- [ ] Check spelling, links, dates, time zones, ownership, and 2026–27 filtering.
- [ ] Review UCL accessibility, privacy, analytics, branding, and external-web
  publishing requirements.
- [ ] Write editor instructions for spreadsheets, previews, corrections, and
  emergency updates.
- [ ] Agree launch acceptance criteria.
- [ ] Resolve review issues and obtain final approval from Professor Lars
  Nesheim.
- [ ] Promote the approved Firebase preview to the live channel.
- [ ] Verify the live site and schedule a post-launch review.

## Decisions

- [x] Project owner and approver: Professor Lars Nesheim.
- [x] Initial review hosting: GitHub Pages.
- [x] Review feedback: GitHub issues linked to the shared review site.
- [ ] Production hosting decision: retain GitHub Pages or migrate to an
  institutionally owned Firebase project.
- [x] Initial public period: 2026–27, with provision for a private archive.
- [x] Intended source-check frequency: daily, once sources and approvals are
  ready.
- [x] Approval: relevant asset owner or, by default, Professor Lars Nesheim.
- [x] Publication authority: UCL Profiles, supplemented by reviewed personal
  webpages; OpenAlex is reconciliation-only unless matched.
- [ ] Editors and reviewers.
- [ ] Institutionally owned Firebase project and administrators.
- [ ] Exact source and owner for every seminar series.
- [ ] Privacy and access arrangements for sign-up pages and unpublished data.
- [ ] Ownership and requirements for Research Computing, Data, Academic
  Partners, and PhD Students.
