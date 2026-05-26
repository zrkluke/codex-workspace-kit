# Workbench 版本控制規則

- Excel workbook 不進 Git。
- 每次有意義的 workbook 修改，都在 `02-workbench/` 建立一份時間戳版本檔。
- 每次建立新版本，都在該 artifact 的 `CHANGELOG.md` 記錄來源、摘要與待確認事項，例如 `02-workbench/schema/CHANGELOG.md`。
- `03-final-exports/` 只放穩定的最終交付檔。
