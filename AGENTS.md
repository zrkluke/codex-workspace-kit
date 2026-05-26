# Codex Workspace Kit

這個 workspace 是通用 Codex 協作模板。除非專案分支另有規則，請遵守本文件。

## Folder Contract

採用 `00-examples/`、`01-source/`、`02-workbench/`、`03-final-exports/` 分層，不做 in-place 修改。

- `00-examples/`: 範例檔與格式參考。不要修改這裡的檔案。
- `01-source/`: 使用者正式提供的原始來源檔。可以讀取與檢查，但除非使用者明確要求，不要覆蓋。
- `02-workbench/`: Codex 與使用者協作整理、草稿、檢查報告與中間版本。
- `03-final-exports/`: 最後交付或匯出的穩定版本。

如果正式 source 檔尚未存在，請提醒使用者把檔案放到 `01-source/`；不要把 `00-examples/` 當正式工作檔。

## Active File Confirmation

每次要修改任何 source/workbench/final artifact 之前，先確認 active file：

1. 列出 `01-source/` 與 `02-workbench/` 中相關候選檔案。
2. 依檔案修改時間判斷最新版本。
3. 告訴使用者目前看起來最新的是哪一份。
4. 詢問使用者是否要基於該檔案繼續，或改用 `01-source/` 的原始檔。
5. 使用者確認後，先建立新的 `02-workbench/` 版本檔。
6. 只能修改新建立的版本檔；不要直接修改 active file。
7. 每次建立新版本都要更新 `02-workbench/reports/CHANGELOG.md`。

## Workbench Versioning

大型二進位檔案預設不進 Git；用檔名與 changelog 管理 workbench 版本。

- 不要 in-place 覆蓋 `01-source/` 的原始檔。
- 修改 `02-workbench/` 檔案前，先另存新檔，不要反覆覆蓋同一份檔案。
- Workbench 檔名格式：
  - `YYYYMMDD-HHMM_<artifact>_<stage>_vNN[_note].ext`
  - 範例：`20260526-1430_requirements_draft_v01_initial.md`
- `02-workbench/reports/CHANGELOG.md` 記錄每個版本的來源、變更摘要、仍待確認事項。
- `03-final-exports/` 只放最後交付版。

## Encoding

文字檔使用 UTF-8。Windows PowerShell 執行 Python script 時，優先使用：

```powershell
python -X utf8 <script.py>
```

若中文輸出亂碼，先設定：

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"
```

## Project Branches

`main` 是通用助手模板。特定 domain 的 skill、script、reference、範例與訪談流程請放在專案分支，例如 `genbi`。
