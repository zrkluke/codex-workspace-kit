import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const examples = [
  {
    path: "00-examples/01-source/schema/Schema__before__example.xlsx",
    ranges: [
      { range: "資料表總表!A1:C4", expected: "DEMO" },
      { range: "表欄位!A1:F13", expected: "CUSTOMER_PROFILE" },
    ],
  },
  {
    path: "00-examples/01-source/knowledge/知識典__example.xlsx",
    ranges: [{ range: "知識典!A1:E5", expected: "CUSTOMER_SEGMENT" }],
  },
  {
    path: "00-examples/01-source/golden/golden__dataset__example.xlsx",
    ranges: [{ range: "golden_dataset!A1:D4", expected: "question" }],
  },
  {
    path: "00-examples/02-workbench/schema/20260525-1430_schema_enriched_v01_example_draft.xlsx",
    ranges: [
      { range: "資料表總表!A1:C4", expected: "DEMO" },
      { range: "表欄位!A1:F13", expected: "CUSTOMER_PROFILE" },
    ],
    redFontRanges: ["表欄位!E4:F4", "表欄位!E8:F9", "表欄位!E12:F12"],
  },
  {
    path: "00-examples/03-final-exports/schema/Schema__after__example.xlsx",
    ranges: [{ range: "Schema After!A1:F4", expected: "CREATE TABLE" }],
  },
];

for (const example of examples) {
  const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(example.path));
  const sheets = await workbook.inspect({
    kind: "sheet",
    include: "name",
    maxChars: 2000,
  });
  console.log(`OK ${example.path}`);
  console.log(sheets.ndjson);

  for (const check of example.ranges) {
    const table = await workbook.inspect({
      kind: "table",
      range: check.range,
      include: "values",
      tableMaxRows: 3,
      tableMaxCols: 6,
      tableMaxCellChars: 80,
      maxChars: 4000,
    });
    if (!table.ndjson.includes(check.expected)) {
      throw new Error(`Unexpected empty or malformed example range: ${check.range}`);
    }
  }

  if (example.redFontRanges) {
    for (const range of example.redFontRanges) {
      const styles = await workbook.inspect({
        kind: "computedStyle",
        range,
        maxChars: 4000,
      });
      if (!styles.ndjson.includes("C00000") && !styles.ndjson.includes("c00000")) {
        throw new Error(`Expected red font in ${example.path}: ${range}`);
      }
    }
  }

  const errors = await workbook.inspect({
    kind: "match",
    searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
    options: { useRegex: true, maxResults: 20 },
    maxChars: 1000,
  });
  if (errors.ndjson.includes("#REF!") || errors.ndjson.includes("#DIV/0!") || errors.ndjson.includes("#VALUE!") || errors.ndjson.includes("#NAME?") || errors.ndjson.includes("#N/A")) {
    throw new Error(`Formula errors found in ${example.path}: ${errors.ndjson}`);
  }
}
