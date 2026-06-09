# GenBI Codex Workspace Kit

這個工作區用來讓 Codex 協助整理 GenBI agent 上線前需要的資料。

主要目標是把資料表 schema、知識典、使用者需求與 golden dataset 整理成 GenBI agent 可以理解並使用的內容。

## 你需要準備什麼

開始時最重要的是資料表 schema Excel。其他資料可以有就先放，沒有也可以在訪談與整理過程中逐步補齊。

- 資料表 schema：資料表、欄位、格式、欄位描述、欄位備註。
- 知識典：共通業務規則、代碼意義、分析口徑。
- 使用者需求：常見問題、固定查詢、希望 GenBI agent 協助的工作。
- Golden dataset：已知的自然語言問題與正確 PostgreSQL SQL；若一開始沒有，後續再建立即可。

## 檔案要放哪裡

請把正式資料放到 `01-source/` 底下對應的資料夾：

```text
01-source/schema/      資料表 schema Excel
01-source/knowledge/   知識典 Excel；尚未整理可先留空
01-source/interview/   訪談文件、需求文件或筆記
01-source/golden/      既有 golden dataset；沒有也正常
```

`00-examples/` 只用來參考格式，不要當成正式工作檔。

## 怎麼開始

把檔案放好後，在 Codex 裡說：

```text
請開始檢查 GenBI prep 文件
```

Codex 會先檢查目前有哪些資料已經齊全、哪些地方還需要你補充，然後分批詢問問題。

## Codex 會協助什麼

- 檢查 schema、知識典、訪談資料與 golden dataset 的缺漏。
- 找出需要補充的欄位描述與欄位備註。
- 協助釐清代碼意義、日期欄位、key、金額欄位、聚合方式與常用篩選條件。
- 判斷哪些資訊應該寫在單一欄位備註，哪些應該整理到知識典。
- 根據訪談內容整理 GenBI agent 常見問題與 golden Q&A。
- 在資料足夠後，協助產出最終 Schema After workbook。

## 工作安全原則

- Codex 不會修改 `00-examples/` 範例檔。
- Codex 不會直接覆蓋 `01-source/` 原始檔。
- 每次加工都會建立新的 `02-workbench/` 工作版本。
- `03-final-exports/` 只放最後交付版本。

## 給維護者

Codex 的詳細操作規則寫在 `AGENTS.md`。如果需要調整 Codex 的工作流程、檢查方式或版本管理規則，請優先更新 `AGENTS.md`。
