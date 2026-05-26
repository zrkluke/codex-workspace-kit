---
name: genbi-prep
description: Prepare GenBI agent onboarding assets from Excel workbooks. Use when Codex is working in this repo or handling GenBI pre-work such as enriching schema column descriptions and notes, identifying knowledge dictionary entries, interviewing users about business questions and SQL/analysis needs, creating golden Q&A datasets, checking workbook completeness, or converting Schema__before Excel files into Schema__after format.
---

# GenBI Prep

## Overview

Use this skill to turn raw GenBI preparation files into agent-ready context: enriched schema, shared knowledge, user interview notes, and golden SQL Q&A.

Start every session by running the workbook checker, then use its findings to drive focused questions with the user.

This repo separates examples, source files, workbench drafts, and final exports. Treat `00-examples/` as read-only format references, read official source workbooks from `01-source/`, use `02-workbench/` for drafts and reports, and write final artifacts to `03-final-exports/`.

## Quick Start

From the workspace root:

```powershell
powershell -ExecutionPolicy Bypass -File .skills/genbi-prep/scripts/session_start_check.ps1 -Root .
```

The wrapper sets UTF-8 for Windows PowerShell. If running Python directly, use `python -X utf8 ...`. If `python` is unavailable, use the Codex bundled Python or any Python environment with `openpyxl`.

When the user asks to produce the final schema workbook, run:

```powershell
python -X utf8 .skills/genbi-prep/scripts/build_schema_after.py
```

The converter defaults to the latest Excel under `01-source/schema/` and writes `03-final-exports/schema/Schema__after.xlsx`. Source filenames may vary. Use explicit `--input` and `--output` only for nonstandard paths or example-file tests.

Before modifying schema, knowledge, golden, interview, or report artifacts, identify and confirm the active file. Compare `01-source/` and `02-workbench/` candidates by modified time:

```powershell
python -X utf8 .skills/genbi-prep/scripts/list_active_candidates.py schema
```

Tell the user which file appears latest and ask whether to continue from it. If a newer `02-workbench/` version exists, prefer it unless the user explicitly wants to restart from `01-source/`.

After the user confirms the active file, create a new `02-workbench/` version from that active file before making any edits. Edit only the newly created version and append `02-workbench/reports/CHANGELOG.md`; never modify the confirmed active workbook in place.

When creating or updating workbench Excel files, do not overwrite an existing workbook. Use filename-based versions and update the changelog:

```powershell
python -X utf8 .skills/genbi-prep/scripts/version_workbench_artifact.py schema --source "<confirmed-active-file.xlsx>" --stage enriched --note first_pass --summary "Initial schema enrichment draft from confirmed active file."
```

Read `references/prep-checklist.md` when you need the detailed interview checklist or workbook acceptance criteria.

## Workflow

1. Inspect the workspace and run the checker.
2. Run `list_active_candidates.py` for the artifact you are about to modify and confirm the active file with the user.
3. Create the next `02-workbench/` version from the confirmed active file with `version_workbench_artifact.py`.
4. Edit only that new version file.
5. Summarize missing or weak items by workbook, sheet, table, and column.
6. Ask the user focused questions in small batches. Prefer asking about a table or business topic at a time.
7. Put single-column facts in `表欄位`:
   - `欄位描述(COLUMN_DESC)`: what the column means in business terms.
   - `欄位備註(COLUMN_NOTES)`: code meanings, SQL usage rules, mapping CTEs, filters, null handling, aggregation caveats, and examples.
8. Put cross-column or reusable domain knowledge in `知識典`, not in one column note.
9. Capture user-provided interview source files in `01-source/interview/` and Codex-organized interview notes in `02-workbench/interview/`.
10. Treat missing golden data at project start as normal. Create golden Q&A only after interview and schema context are sufficient, usually as a draft under `02-workbench/golden/`; use `01-source/golden/` only when the user already has an existing dataset.
11. Generate or update Schema After only after the schema descriptions and notes are strong enough to support SQL generation.
12. For every workbench workbook revision, create a new timestamped filename and append `02-workbench/reports/CHANGELOG.md`.

## What To Ask

For each table:

- What business process or dashboard does this table support?
- What is the grain: one row per customer, application, transaction, month, product, or something else?
- Which date column should answer "latest", monthly, quarterly, or period comparison questions?
- Which columns are keys? Which keys require distinct counts?
- Which columns are codes? Where are their labels stored?
- Which numeric columns are additive, averages, ratios, balances, or pre-aggregated values?
- Which filters are mandatory to avoid double-counting, such as product "整體" codes or non-empty customer IDs?

For the GenBI agent:

- Should it only write SQL, or also execute SQL, analyze results, and draw charts?
- What are the top recurring business questions?
- What output shape is expected: SQL only, table, insight summary, chart, or dashboard-ready result?
- What golden questions represent the must-pass behavior?

## Schema After Conversion

Build the after workbook with these columns:

- `schema`: parse the schema prefix from `資料表總表!B:B`.
- `table_name`: parse the table name from `資料表總表!B:B`.
- `field`: use `資料表總表!A:A`.
- `table_description`: use the first sentence of `資料表總表!C:C`, split on the first `，`, `,`, `。`, or newline.
- `table_summary`: use the full `資料表總表!C:C`.
- `table_schema`: create SQL from `表欄位` columns A, C, D, E, and F.

Treat generated SQL as a draft. Review quoting, commas, comments, and any notes containing SQL snippets.

## Bundled Resources

- `scripts/check_genbi_prep.py`: inspect workbook completeness and print user-facing TODOs.
- `scripts/list_active_candidates.py`: list latest `01-source/` and `02-workbench/` files before choosing an active file.
- `scripts/build_schema_after.py`: create the Schema After workbook draft.
- `scripts/version_workbench_artifact.py`: create timestamped workbench artifact versions and changelog entries.
- `references/prep-checklist.md`: detailed checklist for schema enrichment, knowledge dictionary entries, interview notes, and golden Q&A.

## Output Style

Report findings in Traditional Chinese unless the user asks otherwise. Keep the report actionable: list exact workbook, sheet, row, table, and column where possible, then propose the next questions to ask.


