# GenBI Codex Workspace Kit

這個 workspace 用來協助完成 GenBI agent 上線前的前置作業：補齊資料表 schema、整理知識典、訪談使用者需求，並建立 golden dataset 的自然語言問題與 PostgreSQL SQL。

## Session Start

每次開始工作時，先檢查目前文件狀態，並把「需要使用者補充」的項目條列給使用者：

```powershell
powershell -ExecutionPolicy Bypass -File .skills/genbi-prep/scripts/session_start_check.ps1 -Root .
```

如果不用 wrapper，請用 `python -X utf8 .skills/genbi-prep/scripts/check_genbi_prep.py --root .`，避免 Windows PowerShell 預設 cp950 導致繁中輸出或 UTF-8 文件讀取失敗。如果系統環境沒有 `python`，改用 Codex bundled Python 或使用者目前環境中可執行 `openpyxl` 的 Python。檢查結果只是一份待辦清單；仍需透過訪談判斷哪些資訊應寫入欄位描述、欄位備註或知識典。

## Required Skill

處理本專案時優先使用 repo 內的 `$genbi-prep` skill：

- Skill path: `.skills/genbi-prep/SKILL.md`
- 檢查器: `.skills/genbi-prep/scripts/check_genbi_prep.py`
- Active file 候選檢查器: `.skills/genbi-prep/scripts/list_active_candidates.py`
- Session-start hook 草稿: `.skills/genbi-prep/scripts/session_start_check.ps1`
- Schema 轉換器: `.skills/genbi-prep/scripts/build_schema_after.py`
- Workbench 版本命名工具: `.skills/genbi-prep/scripts/version_workbench_artifact.py`
- 作業 checklist: `.skills/genbi-prep/references/prep-checklist.md`

## Folder Contract

這個專案採用 `00-examples/`、`01-source/`、`02-workbench/`、`03-final-exports/` 分層，不做 in-place 修改。

- `00-examples/`: 只放範例檔，用來讓 Codex 理解欄位與格式。不要修改這裡的 Excel。
- `01-source/`: 使用者正式提供的原始來源檔。Codex 可以讀取並檢查，但除非使用者明確要求，不要覆蓋原始檔。
- `02-workbench/`: Codex 與使用者協作整理、enrich、訪談紀錄、檢查報告與中間草稿的工作區。
- `03-final-exports/`: 最後交付或匯出的版本，例如 Schema after、enriched golden dataset、最終報告。

主要路徑：

- `00-examples/01-source/schema/Schema__before__example.xlsx`: before schema 格式範例。
- `00-examples/01-source/knowledge/知識典__example.xlsx`: 知識典格式範例。
- `00-examples/01-source/golden/golden__dataset__example.xlsx`: golden Q&A 格式範例。
- `00-examples/02-workbench/schema/20260525-1430_schema_enriched_v01_example_draft.xlsx`: 中間草稿輸出範例，用來示範 Codex 產生後、尚待 review 的 schema after 草稿。
- `00-examples/02-workbench/reports/CHANGELOG.md`: workbench changelog 格式範例。
- `00-examples/03-final-exports/schema/Schema__after__example.xlsx`: after schema 最終匯出格式範例。
- `01-source/schema/`: 使用者正式提供的原始資料表 schema。核心 sheet 是 `資料表總表` 與 `表欄位`。
- `01-source/knowledge/`: 使用者正式提供的原始共通知識典。
- `01-source/interview/`: 使用者提供的原始訪談資料或需求文件。
- `01-source/golden/`: 若使用者一開始已有 golden Q&A dataset，放在這裡；沒有也正常，通常會在訪談與 schema enrich 後建立。
- `02-workbench/schema/`: schema enrich 工作檔與中間版本。
- `02-workbench/knowledge/`: 知識典整理工作檔。
- `02-workbench/interview/`: Codex 整理後的訪談紀錄。
- `02-workbench/golden/`: golden dataset 草稿與修訂版。
- `02-workbench/reports/`: 檢查報告、待補清單、訪談問題清單。
- `03-final-exports/schema/Schema__after.xlsx`: 最終 GenBI schema after workbook。
- `03-final-exports/golden/`: 最終 golden dataset。
- `03-final-exports/reports/`: 最終檢查報告或交付摘要。

如果正式 source 檔尚未存在，請提醒使用者把檔案放到對應 `01-source/` 目錄；不要把 `00-examples/` 當正式工作檔。

正式 source 檔名可以自訂。Codex 與 scripts 預設掃描對應資料夾中的 Excel，並以檔案修改時間挑出最新候選；若有多個候選檔，先跟使用者確認 active file。

## Workbench Versioning

Excel 檔案不進 Git；本專案用檔名與 changelog 管理 workbench 版本。

- 不要 in-place 覆蓋 `01-source/` 的原始檔。
- 修改 `02-workbench/` 的 Excel 前，先另存新檔，不要反覆覆蓋同一份 workbook。
- Workbench 檔名格式：
  - `YYYYMMDD-HHMM_<artifact>_<stage>_vNN[_note].xlsx`
  - 範例：`20260525-1430_schema_enriched_v01_code_mapping_added.xlsx`
- `02-workbench/reports/CHANGELOG.md` 記錄每個版本的來源、變更摘要、仍待確認事項。
- `CHANGELOG.md` 與 `reports/` 內的工作紀錄預設使用繁體中文，方便使用者閱讀追蹤。
- `03-final-exports/` 只放最後交付版，檔名可以穩定，例如 `Schema__after.xlsx`。

產生下一版 workbench 檔名或複製來源檔時，使用：

```powershell
python -X utf8 .skills/genbi-prep/scripts/version_workbench_artifact.py schema --source "<confirmed-active-file.xlsx>" --stage enriched --note first_pass --summary "Initial schema enrichment draft from confirmed active file."
```

只預覽下一個檔名：

```powershell
python -X utf8 .skills/genbi-prep/scripts/version_workbench_artifact.py schema --stage enriched --note user_review --dry-run
```

## Active File Confirmation

每次要修改 schema、knowledge、golden dataset、interview notes 之前，必須先確認 active file。

流程：

1. 先列出 `01-source/` 與 `02-workbench/` 的候選檔案，依檔案修改時間判斷最新版本。
2. 告訴使用者目前看起來最新的是哪一份。
3. 詢問使用者是否要基於該檔案繼續，或改用 `01-source/` 的原始檔。
4. 使用者確認後，必須先建立新的 `02-workbench/` 版本檔。
5. 只能修改新建立的版本檔；不要直接修改 active file。
6. 每次建立新版本都要更新 `02-workbench/reports/CHANGELOG.md`。

範例：

```powershell
python -X utf8 .skills/genbi-prep/scripts/list_active_candidates.py schema
```

如果 `02-workbench/` 有比 `01-source/` 更新的檔案，優先建議從最新 workbench 版本繼續；除非使用者明確指定重新從 source 開始。

建立下一版後再修改：

```powershell
python -X utf8 .skills/genbi-prep/scripts/version_workbench_artifact.py schema --source "<confirmed-active-file.xlsx>" --stage enriched --note user_review --summary "Created next schema workbench version from confirmed active file."
```

## Work Goals

第一部分，準備資料：

- `表欄位` 一開始通常只有 `資料表名稱(A)`、`欄位標號(B)`、`欄位名稱(C)`、`欄位格式(D)`。
- 必須透過互動訪談，協助使用者補齊並 enrich `欄位描述(E)` 與 `欄位備註(F)`。
- 若 `欄位描述(E)`、`欄位備註(F)` 已有內容，仍需檢查是否足以支援 SQL 生成：代碼意涵、join/mapping 規則、日期語意、聚合方式、分母分子、空值處理、去重邏輯都要問清楚。
- 若討論出來的內容是共通業務邏輯或 domain knowledge，且不屬於單一欄位，建議寫入知識典。
- 最後將 before schema 整理成 after 格式：`schema`、`table_name`、`field`、`table_description`、`table_schema`、`table_summary`。

第二部分，使用者需求訪談：

- 問清楚使用者希望 GenBI agent 做什麼。
- 釐清 agent 是協助寫 SQL，還是直接撈 SQL 資料後做洞察分析與圖表。
- 蒐集最常被問的業務問題、常用查詢、固定分析口徑、常見篩選條件、常用時間區間與輸出格式。

第三部分，請使用者設計 Q&A：

- 參考 `00-examples/01-source/golden/golden__dataset__example.xlsx` 的格式。
- Golden dataset 不要求在專案一開始就存在；通常等使用者需求訪談與 schema enrich 有足夠 context 後，再建立 `02-workbench/golden/` 草稿。
- 若使用者已經提供既有 golden dataset，放入 `01-source/golden/`；若是 Codex 與使用者共同設計的新題目，先寫入 `02-workbench/golden/` 草稿。
- 將問題寫入 `question`，將正確 PostgreSQL 寫入 `correct_postgres_sql`。
- 每個 Q&A 都應盡量覆蓋真實高頻問題、重要表關聯、重要指標口徑與容易出錯的 domain logic。

## Schema After Rules

`03-final-exports/schema/Schema__after.xlsx` 的欄位來源：

- `schema`: 從 `01-source/schema/` 的 `資料表總表` sheet `資料表名稱(B)` 解析 schema，例如 `BACC_TEMP3.TABLE_NAME` 取 `bacc_temp3`。
- `table_name`: 從 `資料表總表` 的 `資料表名稱(B)` 解析 table，例如 `BACC_TEMP3.TABLE_NAME` 取 `TABLE_NAME`。
- `field`: 從 `資料表總表` 的 `場景(A)` 取得。
- `table_description`: 從 `資料表總表` 的 `資料表說明(C)` 取第一句話，以第一個逗號、中文逗號、句號或換行為分界。
- `table_summary`: 從 `資料表總表` 的 `資料表說明(C)` 取得完整描述。
- `table_schema`: 從 `表欄位` 的 `資料表名稱(A)`、`欄位名稱(C)`、`欄位格式(D)`、`欄位描述(E)`、`欄位備註(F)` 寫成 SQL `CREATE TABLE` 語法。

可用下列 script 產生 after 檔案草稿，再由 Codex 與使用者 review：

```powershell
python -X utf8 .skills/genbi-prep/scripts/build_schema_after.py
```

預設讀取 `01-source/schema/` 中修改時間最新的 Excel，輸出 `03-final-exports/schema/Schema__after.xlsx`。若要測試範例格式，可以明確指定：

```powershell
python -X utf8 .skills/genbi-prep/scripts/build_schema_after.py --input "00-examples/01-source/schema/Schema__before__example.xlsx" --output "02-workbench/schema/Schema__after__example_test.xlsx"
```

## Interview Style

與使用者互動時，不要一次丟出過多問題。優先針對檢查器列出的缺漏欄位分批詢問：

- 先問資料表用途與高頻場景。
- 再問常用欄位、key、日期欄位、金額欄位、代碼欄位。
- 對每個代碼欄位追問代碼對照、是否需要 mapping table 或 CTE。
- 對每個指標欄位追問計算公式、分母分子、是否需去重、是否需排除空值或篩選整體代碼。
- 發現跨欄位共用規則時，明確建議寫入知識典。





