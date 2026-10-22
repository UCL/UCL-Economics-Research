---
name: seminar-update
description: Refresh one seminar series' schedule on the website from its approved online source — preflight checks, a dated update branch, the importer run, a written review of every change with anomaly flags, one stop for approval, then commit, push and a pull request against main. Use when an organiser says a seminar spreadsheet has been updated, when the user says "update the applied/finance/macro seminars", "run the seminar update", or runs /seminar-update. Defaults to the Applied Economics series. Never commits in a non-interactive session.
argument-hint: "[series-id] [--owner <name>] [--dry-run]"
---

# Seminar update

The seminar organisers maintain their schedules in online sources (Google Sheets, the IFS and CeMMAP pages, a CSV). The website does not read those sources live: `scripts/import_seminars.mjs` fetches them, validates them, and writes three tracked files per series, which a pull request carries to `main`, where GitHub Actions builds and deploys the review site.

This skill runs that pipeline for one series and stops exactly once, at the review, before anything irreversible.

## Arguments

- `series-id`: an `id` from `seminars/config/series.json`. Default: `applied-economics`. The others are `econometrics`, `economic-theory`, `finance`, `macroeconomics`, `phd-seminar`, `ifs-seminars`, `ifs-development`, `ifs-labour`.
- `--owner <name>`: the prefix of the update branch. Default: `git config seminar-update.owner` if set (set it once per clone, for example `git config seminar-update.owner joao`), otherwise the first word of `git config user.name`, lowercased.
- `--dry-run`: run the preflight and the import, write the review, and stop. Leave the branch and the working-tree changes in place for the user to inspect; do not ask for approval.

All scripts live in this skill's `scripts/` directory and are run from the repository root.

## Phase 1 — preflight (deterministic)

Run `scripts/preflight.sh <series-id> [--owner <name>]`. It prints one PASS/FAIL/INFO line per check and exits non-zero on any FAIL. On failure: report the failing checks and what the user must do, and stop. Never proceed partially.

Checks: inside the repository with `origin` reachable; Node 18+ and `node_modules/exceljs` installed; `gh` authenticated; the series ID exists in the config; `main` is checked out; the working tree is clean; `main` is not ahead of or diverged from origin. If `main` is behind origin the script fast-forwards it. Finally it creates and checks out the branch `<owner>/<series-id>-update-<YYYY-MM-DD>` and prints it on a `BRANCH` line. The branch must not already exist locally or on origin.

## Phase 2 — import (deterministic)

Run `node scripts/import_seminars.mjs --series <series-id>` and keep its full output. The importer downloads the source, rewrites the series' offline snapshot under `seminars/sources/`, rewrites `site/data/seminars.json`, writes a review workbook to `outputs/seminars/` (gitignored, for opening in Excel), and regenerates every calendar feed under `site/public/calendars/`.

Two things in the output matter for the review:

- Any line printed to stderr that names the series. The importer does not stop when the source is unreachable: it logs the error and rebuilds from the offline snapshot, which yields no changes. Treat such a line as a failed import and say so.
- The importer may rewrite files unrelated to the series, for example reordering `site/data/series-organisers.json`. Phase 3 lists these as incidental; Phase 5 reverts them.

## Phase 3 — review (judgment, no edits)

Run `node scripts/summarise_diff.mjs <series-id>`. It compares the series' records in `site/data/seminars.json` against `HEAD`, lists every added, removed and edited seminar field by field, flags anomalies, and lists which files changed, split into the three expected files and incidental ones.

Write the review for the user from that output. The deterministic summary is the record; the review adds judgment. Shape:

1. One line saying the import ran cleanly, or did not, and the branch name.
2. The content changes, one bullet per seminar, date first, then speaker, then what changed in words. Quote added or changed titles.
3. The flags, each with a one-sentence reading. The script raises:
   - the same speaker on more than one date in the series (a second visit, or a stray row);
   - an upcoming seminar with no title or a status other than Scheduled;
   - a seminar whose date moved, or that was removed (check it was not meant to be cancelled instead);
   - no changes at all (the source was unreachable, or nothing changed since the last run);
   - overrides in `seminars/config/series.json` for this series (an override is a manual patch over the source; once the source carries the same value it is redundant and can be removed in the same pull request, but that is the user's call).
   Add any further observation the diff suggests. Do not pad: a clean diff gets a short review.
4. A table of files changed, naming the incidental ones and stating they will be reverted.
5. The proposed action, in one sentence.

With `--dry-run`, stop here.

## Phase 4 — approval (one gate)

If the session is non-interactive, stop here: report that the review is ready and that the branch holds the uncommitted changes, and do not commit. Everything up to this point is reversible with `git checkout -- . && git checkout main && git branch -D <branch>`.

Otherwise ask the user once, with the proposed action first:

- proceed as proposed;
- proceed with a stated amendment (for example, also remove a redundant override, or keep an incidental file);
- abort: revert the working tree, return to `main`, delete the branch, and report.

Do not ask twice. If the user amends, apply the amendment on the branch, re-run `summarise_diff.mjs`, and continue.

## Phase 5 — commit, push, pull request (deterministic)

1. Write the commit message to a file in the scratchpad. Subject: `Update <series name> seminar schedule`. Body: one paragraph that names the source and lists the changes in words, in the same order as the review, ending with "The calendar feed was regenerated." when the feed changed. End with the attribution line this project uses for assisted commits:

   ```
   Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
   ```

2. Write the pull-request body to a second file: the command that produced the change, the change list as bullets, a note of any incidental file that was reverted, and the line `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

3. Run `scripts/finalize.sh <series-id> <commit-message-file> "<pull-request title>" <pull-request-body-file>`. The script refuses to run on `main`; reverts every modified tracked file outside the series' expected set, printing each; stages the expected files; commits; pushes the branch with upstream tracking; opens the pull request against `main` with `gh`; and prints its URL.

4. Report: the pull-request URL, the commit, the files committed, any file reverted, and two reminders — merging the pull request triggers the GitHub Pages deployment automatically, and the working tree is still on the update branch, so the next piece of work should start from `main`.

## What the skill refuses to do

- Proceed past a failed preflight check, or commit when the import reported an error for the series.
- Commit in a non-interactive session, or without the Phase 4 approval.
- Commit a file outside the series' expected set, or the review workbook under `outputs/`.
- Edit `seminars/config/series.json` or any source file unless the user asked for it at Phase 4.
- Push to `main`, or merge the pull request. Merging is the content owner's decision.
