# Schema Workbench 版本紀錄範例

## 2026-05-25

### 00-examples/02-workbench/schema/20260525-1430_schema_enriched_v01_example_draft.xlsx
- 來源：`00-examples/01-source/schema/Schema__before__example.xlsx`
- 摘要：由 source schema 格式範例產生 schema workbench 草稿範例。
- 紅字標示：
  - `表欄位!E4:F4`：補上 `segment_code` 的欄位描述與代碼對照備註。
  - `表欄位!E8:F9`：補強 `order_date` 與 `order_status` 的 SQL 使用語意。
  - `表欄位!E12:F12`：補上 `category_code` 的分類代碼說明。
- 刪除檢視：本範例沒有刪除列；若正式 workbench 需要刪除內容，先以紅字註記刪除原因或刪除狀態。
- 備註：這份檔案示範 workbench 時間戳命名、紅字標示變更，以及 artifact-local changelog；實際作業時，每次有意義的修改都要在同一個 artifact 資料夾內更新 `CHANGELOG.md`。
