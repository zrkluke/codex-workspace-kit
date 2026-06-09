# GenBI Prep Checklist

## Session Start Checklist

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .agents/skills/genbi-prep/scripts/session_start_check.ps1 -Root .
```

If running Python directly on Windows, use `python -X utf8 ...` so Traditional Chinese output and UTF-8 files do not fall back to cp950.

Then tell the user:

- Whether official source files exist under `01-source/`.
- Which expected files are missing.
- Which sheets are missing.
- Which schema rows have empty or thin `欄位描述`.
- Which common/key/code-looking rows have empty or thin `欄位備註`.
- Whether `知識典` has reusable business rules.
- Whether `01-source/interview/` or `02-workbench/interview/` has any interview notes.
- If a golden dataset already exists, whether rows have both `question` and `correct_postgres_sql`; if it does not exist yet, mark it as a later deliverable rather than a missing starting file.
- Which `01-source/` or `02-workbench/` file appears to be the latest active candidate before editing.

Use `00-examples/` only as read-only format reference. It contains only folders with actual example files, such as `00-examples/01-source/` source-file shapes, `00-examples/02-workbench/` draft/intermediate output examples, and `00-examples/03-final-exports/` final export examples. Do not edit example workbooks during normal prep work. Use `02-workbench/` for drafts and intermediate reports, and `03-final-exports/` for final deliverables.

## Workbench Versioning

Real source and workbench Excel files are not tracked in Git. Only synthetic example workbooks under `00-examples/**/*.xlsx` are tracked as format references. Track each real artifact's local workbook history with filenames plus an artifact-local changelog such as `02-workbench/schema/CHANGELOG.md`.

`02-workbench/**/CHANGELOG.md` is a local user/project record and should not be committed. Keep example changelogs under `00-examples/**/CHANGELOG.md` tracked as format references.

Filename format:

```text
YYYYMMDD-HHMM_<artifact>_<stage>_vNN[_note].xlsx
```

Examples:

```text
20260525-1430_schema_enriched_v01_first_pass.xlsx
20260525-1600_schema_enriched_v02_user_reviewed.xlsx
20260525-1705_golden_workbench_v01_added_top_questions.xlsx
```

Rules:

- Do not overwrite `01-source/` files.
- Do not repeatedly overwrite the same `02-workbench/` Excel workbook.
- Create a new version for each meaningful user review, enrichment pass, or generated draft.
- Mark every added, modified, or deletion-review cell/row in red font in the new workbench workbook version.
- For deletions, keep a red deletion note or status in the workbench version first; do not silently remove source content before user review.
- Record source file, summary, changed rows/cells, deletion-review items, and unresolved questions in the same artifact folder's `CHANGELOG.md`.
- Keep `03-final-exports/` for stable final deliverables.

Use:

```powershell
python -X utf8 .agents/skills/genbi-prep/scripts/version_workbench_artifact.py schema --source "<confirmed-active-file.xlsx>" --stage enriched --note first_pass --summary "Initial schema enrichment draft from confirmed active file."
```

Source filenames may vary. Keep files in the right folder, then use `list_active_candidates.py` to choose the active file by modified time before creating a workbench version.

## Active File Confirmation

Before editing any workbook or workbench note, run:

```powershell
python -X utf8 .agents/skills/genbi-prep/scripts/list_active_candidates.py schema
```

Replace `schema` with `knowledge`, `golden`, `interview`, or `reports` as needed.

Rules:

- Compare `01-source/` and `02-workbench/` by modified time.
- Tell the user which file appears latest.
- Ask whether to continue from that file or restart from source.
- If the user confirms a workbench file, create the next version from that file before editing.
- If the user confirms a source file, create the first or next workbench version from source before editing.
- Edit only the newly created version file.
- Record the new version in the same artifact folder's `CHANGELOG.md`, for example `02-workbench/schema/CHANGELOG.md`.
- In the workbook, use red font to mark cells or rows touched in this revision so the user can review added, changed, and deletion-review content quickly.
- Write changelog and reports in Traditional Chinese by default.

## Schema Enrichment

Use `表欄位` sheet as the main working surface.

Minimum useful `欄位描述`:

- Explain the business meaning, not only the English column name.
- State unit for amount fields, such as NTD, count, percentage, month, day.
- State time semantics for date fields, such as data snapshot date, transaction date, application date, or ETL date.
- State row-level grain when the column identifies customer, transaction, application, account, or product.

Minimum useful `欄位備註`:

- Explain code values, label mapping, and whether a mapping CTE is needed.
- Mention mandatory filters that prevent double counting.
- Mention null or blank-string handling.
- Mention whether `COUNT(DISTINCT ...)`, `SUM(...)`, average, ratio, or window logic is normally expected.
- Include SQL snippets only when they are stable and reusable.

Move content to `知識典` instead of a single row note when it is:

- A metric formula used by multiple columns or tables.
- A product/customer/domain definition.
- A reusable SQL convention.
- A common exclusion rule or population definition.
- A term users ask about in natural language.

## User Interview

Capture:

- Desired agent role: SQL authoring only, SQL execution, insight analysis, chart generation, or all of the above.
- Most common business questions.
- Common filters: time period, product, customer group, branch, channel, status.
- Standard output expectations: SQL, data table, chart, natural-language insight, or downloadable file.
- Definitions that affect SQL: denominator, numerator, comparison period, latest data rule, ranking rule.

Store raw user-provided notes under `01-source/interview/`. Store Codex-organized notes under `02-workbench/interview/`. If no preferred file exists, create a concise Markdown note such as `interview-notes.md`.

## Golden Dataset

Golden dataset is normally created after the user interview and schema enrichment have enough context. It is not required at project start.

If the user already has a golden dataset, place it in `01-source/golden/`. If Codex and the user are designing new Q&A together, create a draft under `02-workbench/golden/`. The core columns are:

- `question`: realistic natural-language business question.
- `correct_postgres_sql`: correct PostgreSQL query.
- `correct_postgres_execution_result`: optional but useful when result verification is available.

Good golden questions cover:

- High-frequency user questions.
- Important table joins and code mappings.
- Date range and period comparison.
- Metrics that require distinct counts or special denominators.
- Product/customer group rankings.
- Edge cases where missing filters cause double counting.

## Schema After Acceptance

The final workbook should be written to `03-final-exports/schema/Schema__after.xlsx` and match `00-examples/03-final-exports/schema/Schema__after__example.xlsx`:

- `schema`
- `table_name`
- `field`
- `table_description`
- `table_schema`
- `table_summary`

Check before finalizing:

- Every table in `資料表總表` appears once.
- `table_description` is the first sentence or first clause of `資料表說明`.
- `table_summary` preserves the full table description.
- `table_schema` includes every column from `表欄位`.
- Column comments combine description and notes without losing SQL-sensitive quotes.
- Draft `CREATE TABLE` syntax is readable and consistent enough for GenBI agent context.




