# Task list

This is a working backlog for the UCL Economics Research webpages. Tasks are
grouped by phase; ordering within a phase may change after stakeholder review.

## Immediate goal: working Firebase prototype

Launch a working prototype on Firebase Hosting by **19 September 2026**. It
will provide responsive, accessible, UCL-inspired pages listing upcoming
seminars, visitors, and events for the 2026–27 academic year.

The prototype will:

- [ ] Provide working Seminars, Visitors, and Events pages.
- [x] Include an All seminars tab plus six subject tabs: Applied Economics,
  Econometrics, Economic Theory, Finance, Macroeconomics, and IFS Seminars.
- [ ] Display the complete current-term seminar schedule for 2026–27, with the
  next seminar highlighted; display upcoming 2026–27 visitors and events.
- [ ] Use representative CSV or JSON data until spreadsheet imports are ready.
- [ ] Use plain HTML, CSS, and minimal JavaScript, structured so that Eleventy
  can be introduced without redesigning the pages.
- [ ] Work on phone, tablet, and desktop screen sizes.
- [ ] Provide accessible navigation and seminar-tab behaviour.
- [ ] Be deployed to a Firebase Hosting preview address.
- [ ] Retain manual approval by the relevant content owner or Professor Lars
  Nesheim before each prototype publication.

### Two-week prototype schedule

#### 5–7 September 2026 — design and setup

- [ ] Agree representative sample content for all three pages.
- [ ] Establish the shared page layout, navigation, footer, typography, colours,
  and content-card styles.
- [ ] Set up the initial Firebase Hosting project and preview environment.

#### 8–11 September 2026 — build the working pages

- [ ] Build the Seminars page and its six tabs.
- [x] Add an All seminars tab that initially shows the current week across all
  series.
- [x] Add previous- and next-week arrow controls and support Left/Right arrow
  keys while the controls have focus.
- [x] Announce the selected week to assistive technology and show a useful empty
  state when no seminars are scheduled.
- [ ] Add a clean current-term table to each seminar tab with Date, Speaker,
  Title, Location, and Time columns.
- [ ] Display the speaker's institution under their name; link the name to the
  speaker webpage when available and otherwise show plain text.
- [ ] Link seminar titles to papers or slides when available, show unlinked
  titles otherwise, and display **TBA** when no title is supplied.
- [ ] Add a prominent next-seminar summary that repeats the seminar links, links
  the location when available, and links to the relevant sign-up-list entry.
- [ ] List each seminar series' organisers with email addresses.
- [ ] Build the Visitors page.
- [ ] Build the Events page.
- [ ] Add representative upcoming 2026–27 data in CSV or JSON format.
- [ ] Deploy the first complete prototype for review.

#### 12–14 September 2026 — prepare data imports

- [ ] Agree the initial spreadsheet schemas for seminars, visitors, and events.
- [x] Define the standard seminar spreadsheet columns: Date, Speaker,
  Institution, Speaker URL, Title, Paper URL, and Status.
- [x] Create a standard workbook for each of the six seminar series and
  highlight missing values in yellow.
- [x] Store recurring times, locations, and annual organisers separately from
  the seminar schedule; exclude sign-up URLs from the standard spreadsheet.
- [ ] Implement the first spreadsheet import and validation process.
- [ ] Confirm how invalid, incomplete, duplicated, cancelled, and postponed
  records are reported.

#### 15–16 September 2026 — quality checks

- [ ] Test keyboard navigation, focus order, headings, tab semantics, colour
  contrast, and descriptive link text.
- [ ] Test the prototype on representative phone, tablet, and desktop sizes.
- [ ] Check dates, time zones, links, content ownership, and 2026–27 filtering.

#### 17–19 September 2026 — review and launch

- [ ] Ask content owners and reviewers to review the Firebase preview.
- [ ] Correct agreed design, accessibility, and content issues.
- [ ] Obtain publication approval from Professor Lars Nesheim.
- [ ] Launch the working Firebase prototype by 19 September 2026.
- [ ] Record deferred work and priorities for the next iteration.

## 1. Discovery and decisions

- [x] Confirm the project owner and publication approver: Professor Lars
  Nesheim.
- [ ] Appoint editors and reviewers.
- [x] Confirm that the finished webpages will initially be external to the
  existing UCL website and hosted on a Google platform.
- [x] Select Firebase Hosting as the target platform.
- [ ] Arrange an institutionally owned Firebase project.
- [ ] Collect current UCL accessibility, privacy, analytics, and web
  publishing requirements.
- [x] Record the current UCL Economics website as the initial brand reference.
- [ ] Identify an authoritative source and appoint an owner for every seminar
  series.
- [x] Record Professor Lars Nesheim as owner of the visitor and event data.
- [x] Agree that initial sources will be checked daily.
- [ ] Obtain representative spreadsheets and links for all initial sources.
- [x] Confirm that only the 2026–27 academic year will initially be public and
  that earlier years may later be retained privately but not published.
- [x] Confirm that imported or manual changes require approval from the relevant
  asset owner or, by default, the project owner.
- [x] Agree to build the initial prototype with plain HTML, CSS, and minimal
  JavaScript on Firebase Hosting.
- [ ] Validate Eleventy as the longer-term static-site generator after the
  prototype review.

## 2. Model webpages — first deliverable

- [ ] Gather examples of current UCL Economics pages and any webpages whose
  presentation or behaviour should be used as inspiration.
- [ ] Use the current UCL Economics website as the initial brand and content
  reference: <https://www.ucl.ac.uk/social-historical-sciences/economics>.
- [ ] Prepare representative sample content, including long titles, missing
  optional fields, online events, cancelled events, and past dates.
- [ ] Create a shared page shell with header, navigation, breadcrumbs, footer,
  responsive layout, and last-updated information.
- [ ] Create a Seminars model page with all six tabs: Applied Economics,
  Econometrics, Economic Theory, Finance, Macroeconomics, and IFS Seminars.
- [ ] Create a Visitors model page with current, upcoming, and past visits.
- [ ] Create an Events model page with upcoming and past event states.
- [ ] Produce initial content/layout sketches for Research Groups, Publications,
  and PhD Students, clearly marked as works in progress.
- [ ] Test the models on phone, tablet, and desktop screen sizes.
- [ ] Test keyboard navigation, focus order, tab semantics, colour contrast,
  headings, link text, and screen-reader labels.
- [ ] Review model pages with stakeholders and record agreed design changes.
- [ ] Obtain approval for the visual style and content structure.

## 3. Content schemas and source files

- [ ] Define required and optional fields for seminar records.
- [ ] Include academic term, speaker URL, paper/slides URL, location URL,
  sign-up-list URL, organiser name, and organiser email in the seminar schema.
- [ ] Define the academic-term dates and the rule for selecting the next
  upcoming seminar.
- [ ] Define the sign-up-list page URL format and its access, privacy, and data
  retention controls.
- [ ] Define required and optional fields for visitor records.
- [ ] Define required and optional fields for event records.
- [ ] Agree date, time, time-zone, URL, multi-value, and blank-value conventions.
- [ ] Create documented spreadsheet templates in `seminars/`, `visitors/`, and
  `events/`.
- [ ] Define stable identifiers so updates do not create duplicate records.
- [ ] Document how cancellations, postponements, corrections, and deletions are
  represented.
- [ ] Add sample, non-sensitive data for development and testing.

## 4. Imports and validation

- [ ] Implement spreadsheet import for seminars.
- [ ] Implement approved online-source import for relevant seminar series.
- [ ] Implement spreadsheet import for visitors.
- [ ] Implement spreadsheet import for events.
- [ ] Validate required fields, dates, URLs, duplicates, and allowed categories.
- [ ] Produce a clear validation report for editors when an import fails.
- [ ] Record source provenance and the import time for each dataset.
- [ ] Ensure imports cannot expose formulas, scripts, credentials, or private
  spreadsheet fields on the public site.
- [ ] Add automated tests using representative and deliberately invalid files.

## 5. Page implementation

- [ ] Build the approved shared layout and navigation.
- [ ] Build Seminars, including accessible tab behaviour and a useful fallback
  when scripting is unavailable.
- [ ] Make the seminar schedule table readable and operable on narrow screens
  without losing its column labels or meaning.
- [ ] Ensure repeated speaker, paper/slides, location, sign-up, and organiser
  email links have descriptive accessible names and visible focus styles.
- [ ] Build Visitors.
- [ ] Build Events.
- [ ] Add empty, loading, error, cancelled, and no-upcoming-items states.
- [ ] Add sorting, filtering, or search only where user testing shows a need.
- [ ] Add metadata for search engines and social sharing where appropriate.
- [ ] Define and implement archival behaviour for past content.
- [ ] Implement Research Groups, Publications, and PhD Students after their
  requirements and content have been approved.

## 6. Scheduled updates and editorial workflow

- [ ] Configure daily source checks for each agreed source.
- [ ] Add a manual refresh option for authorised editors.
- [ ] Provide a preview of content changes before publication.
- [ ] Notify the responsible editor when validation or publication fails.
- [ ] Avoid notifications when a scheduled run finds no meaningful changes.
- [ ] Document rollback and recovery procedures.
- [ ] Add monitoring for stale data and broken source links.

## 7. Quality, launch, and maintenance

- [ ] Complete accessibility testing against WCAG 2.2 AA.
- [ ] Check current versions of major browsers and common mobile devices.
- [ ] Review privacy, consent, retention, cookies, and analytics requirements.
- [ ] Check spelling, links, dates, time zones, and factual ownership of content.
- [ ] Run performance and basic security checks.
- [ ] Write editor instructions for spreadsheets, previews, corrections, and
  emergency updates.
- [ ] Agree launch acceptance criteria and obtain final approval.
- [ ] Launch and verify the production pages and update jobs.
- [ ] Schedule a post-launch review and assign ongoing maintenance ownership.

## Decisions to record

- [x] Hosting platform: Firebase Hosting
- [ ] Longer-term site generator (recommended: Eleventy after prototype review)
- [ ] Exact source for each seminar series
- [x] Update frequency for each dataset: daily
- [ ] Spreadsheet schemas and access arrangements
- [x] Editorial approval: relevant asset owner or project owner
- [x] Initial publication period: 2026–27 only, with provision for a future
  unpublished archive
- [ ] Ownership of Research Groups, Publications, and PhD Students content
