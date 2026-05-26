# GenBI Codex Workspace Kit

這個 repo 用來準備 GenBI agent 上線前需要的資料文件：

- 資料表 schema 欄位描述與欄位備註
- 知識典與共通 business logic
- 使用者需求訪談紀錄
- Golden dataset 的自然語言問題與 PostgreSQL SQL（通常在訪談與 schema enrich 後建立）
- 最終可交付的 Schema After workbook

## 1. 資料夾用途

```text
00-examples/        範例檔，只看格式，不修改
01-source/          使用者提供的原始檔
02-workbench/       Codex 協作加工區，每次修改都另存新版本
03-final-exports/   最終交付檔
```

`00-examples/` 目前包含：

```text
00-examples/01-source/schema/Schema__before__example.xlsx
00-examples/01-source/knowledge/知識典__example.xlsx
00-examples/01-source/golden/golden__dataset__example.xlsx
00-examples/02-workbench/schema/20260525-1430_schema_enriched_v01_example_draft.xlsx
00-examples/02-workbench/reports/CHANGELOG.md
00-examples/03-final-exports/schema/Schema__after__example.xlsx
```

## 2. 放入原始檔

把正式檔案放到 `01-source/` 對應資料夾。開始時最重要的是 schema Excel；知識典與 golden dataset 可以之後逐步補齊。

```text
01-source/schema/      放資料表 schema Excel
01-source/knowledge/   放知識典 Excel；若尚未整理，可先留空，訪談時再建立
01-source/golden/      若已經有 golden dataset 才放；一開始沒有是正常的
01-source/interview/   放需求訪談文件或筆記
```

檔名可以自訂，不需要叫固定名稱。Codex 會掃描資料夾中的 Excel，預設使用修改時間最新的檔案；如果有多個候選檔，Codex 會先跟你確認要用哪一份。

## 3. 開始檢查

請 Codex 執行 session-start wrapper，會自動指定 UTF-8 編碼：

```powershell
powershell -ExecutionPolicy Bypass -File .skills/genbi-prep/scripts/session_start_check.ps1 -Root .
```

或直接執行 Python checker：

```powershell
python -X utf8 .skills/genbi-prep/scripts/check_genbi_prep.py --root .
```

Codex 會回報：

- 哪些 source 檔案還沒放
- workbook 是否缺 sheet
- schema 欄位描述或欄位備註哪些地方需要補
- 知識典是否已有內容
- 若 golden dataset 已存在，是否缺 `question` 或 `correct_postgres_sql`
- 若 golden dataset 尚未存在，會標成後續建立事項，不視為初期 blocker
- workbench changelog 是否已建立

## 4. 確認要從哪份檔案繼續

修改前先列出 source 與 workbench 的候選檔：

```powershell
python -X utf8 .skills/genbi-prep/scripts/list_active_candidates.py schema
```

可用的 artifact 類型：

```text
schema
knowledge
golden
interview
reports
```

Codex 會依修改時間列出 `01-source/` 和 `02-workbench/` 的候選檔，並問你要不要從最新檔案繼續。

## 5. 建立 workbench 新版本

確認 active file 後，不直接改原檔。先建立新的 workbench 版本：

```powershell
python -X utf8 .skills/genbi-prep/scripts/version_workbench_artifact.py schema --source "<confirmed-active-file.xlsx>" --stage enriched --note first_pass --summary "Create schema enrichment draft from confirmed active file."
```

新檔會出現在 `02-workbench/<artifact>/`，檔名格式為：

```text
YYYYMMDD-HHMM_<artifact>_<stage>_vNN[_note].xlsx
```

例如：

```text
20260525-1430_schema_enriched_v01_first_pass.xlsx
```

每次建立新版本都會更新：

```text
02-workbench/reports/CHANGELOG.md
```

`CHANGELOG.md` 和 `reports/` 內的工作紀錄預設使用繁體中文，方便團隊閱讀與追蹤。

## 6. 和 Codex 一起補資料

Codex 會根據檢查結果分批詢問：

- 欄位描述要怎麼補？
- 欄位備註需要哪些 SQL 規則、代碼意涵、mapping CTE？
- 哪些 business logic 應該寫入知識典？
- GenBI agent 需要回答哪些常見問題？
- 等訪談與 schema context 足夠後，哪些問題應該整理成 golden Q&A？

原則：

- 單一欄位的資訊寫回 schema 的欄位描述或欄位備註。
- 跨欄位、跨資料表、共通 business logic 寫到知識典。
- 每次修改 Excel 都建立新的 workbench 檔案，不覆蓋舊版本。

## 7. 產出 Schema After

當 schema enrich 到可以支援 SQL 生成後，產出最終 schema：

```powershell
python -X utf8 .skills/genbi-prep/scripts/build_schema_after.py --input "<confirmed-workbench-schema.xlsx>" --output "03-final-exports/schema/Schema__after.xlsx"
```

如果不指定 `--input`，script 會使用 `01-source/schema/` 中修改時間最新的 Excel。正式產出時建議明確指定已確認的 workbench 版本。

## 8. Git 與 Excel

Excel 檔案不進 Git。這個 repo 用 `.gitignore` 排除：

```text
*.xlsx
*.xlsm
*.xls
~$*
```

Excel 的版本歷史靠：

- `02-workbench/` 的版本化檔名
- `02-workbench/reports/CHANGELOG.md`

文字檔如 README、AGENTS、scripts、changelog 可以進 Git，保留可 diff 的流程與紀錄。

## 9. Windows 編碼設定

本 repo 的文件與腳本輸出都使用 UTF-8。Windows PowerShell 若使用 cp950，可能會讓繁體中文輸出變亂碼，或讓 Python 讀 UTF-8 文件失敗。

建議：

- 優先用 `session_start_check.ps1` 啟動檢查，它會設定 UTF-8。
- 直接跑 Python script 時使用 `python -X utf8 ...`。
- 若要驗證 skill，也使用 `python -X utf8 C:\Users\wistronits\.codex\skills\.system\skill-creator\scripts\quick_validate.py .skills/genbi-prep`。

## 10. 最短使用方式

1. 把 schema Excel 放進 `01-source/schema/`
2. 跟 Codex 說：「請開始檢查 GenBI prep 文件」
3. Codex 會跑 checker，列出缺漏
4. 確認 active file
5. 建立 workbench 新版本
6. 開始逐欄補資料、整理知識典，之後再設計 golden Q&A

