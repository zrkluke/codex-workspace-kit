# Codex Workspace Kit

這個 repo 是通用版 Codex workspace kit，用來管理「來源檔」、「工作草稿」與「最後交付」的協作流程。

核心原則：

- 不直接覆蓋使用者提供的原始檔。
- 大型二進位檔案預設不進 Git。
- 每次重要修改都在 workbench 建立新版本。
- 最後交付檔集中放在 final exports。
- 專案型 domain 規則請放在專案分支，例如 `genbi`。

## 資料夾用途

```text
00-examples/        範例檔，只看格式，不修改
01-source/          使用者提供的原始檔
02-workbench/       Codex 協作加工區，每次修改都另存新版本
03-final-exports/   最終交付檔
```

## 建議流程

1. 把正式來源檔放進 `01-source/`。
2. 請 Codex 先檢查目前有哪些檔案、缺哪些資訊。
3. 修改前先確認 active file。
4. 從 active file 建立 `02-workbench/` 新版本。
5. 只修改新版本，不覆蓋原始檔或上一版。
6. 把變更摘要寫入 `02-workbench/reports/CHANGELOG.md`。
7. 最終版輸出到 `03-final-exports/`。

## 版本控制

建議 workbench 檔名：

```text
YYYYMMDD-HHMM_<artifact>_<stage>_vNN[_note].ext
```

範例：

```text
20260526-1430_requirements_draft_v01_initial.md
20260526-1600_dataset_review_v02_user_feedback.xlsx
```

Excel、Word、PDF、PowerPoint 等二進位檔案預設由 `.gitignore` 排除。若某個範例檔確定需要進 Git，請刻意調整 `.gitignore`，不要用 `git add -f` 偷渡。

## 分支策略

- `main`: 通用 Codex workspace kit。
- 專案分支: 放特定 domain 的 skill、script、reference 與範例，例如 `genbi`。

## Windows 編碼

本 repo 文件使用 UTF-8。Windows PowerShell 若使用 cp950，可能會讓繁體中文輸出亂碼。

建議直接使用：

```powershell
python -X utf8 <script.py>
```

或在 PowerShell session 設定：

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"
```
