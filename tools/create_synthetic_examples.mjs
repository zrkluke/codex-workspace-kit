import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = process.cwd();

const paths = {
  schemaBefore: `${root}/00-examples/01-source/schema/Schema__before__example.xlsx`,
  knowledge: `${root}/00-examples/01-source/knowledge/知識典__example.xlsx`,
  golden: `${root}/00-examples/01-source/golden/golden__dataset__example.xlsx`,
  workbench: `${root}/00-examples/02-workbench/schema/20260525-1430_schema_enriched_v01_example_draft.xlsx`,
  schemaAfter: `${root}/00-examples/03-final-exports/schema/Schema__after__example.xlsx`,
};

async function ensureDirs() {
  await Promise.all(
    Object.values(paths).map((p) =>
      fs.mkdir(p.slice(0, p.lastIndexOf("/")), { recursive: true }),
    ),
  );
}

function styleHeader(sheet, range) {
  const header = sheet.getRange(range);
  header.format = {
    fill: "#1F4E79",
    font: { bold: true, color: "#FFFFFF" },
    wrapText: true,
  };
  header.format.borders = { preset: "all", style: "thin", color: "#B7B7B7" };
}

function styleBody(sheet, range) {
  const body = sheet.getRange(range);
  body.format = {
    wrapText: true,
    verticalAlignment: "top",
  };
  body.format.borders = { preset: "all", style: "thin", color: "#D9E2F3" };
}

function setWidths(sheet, widths) {
  widths.forEach((width, index) => {
    sheet.getCell(0, index).format.columnWidth = width;
  });
}

function markWorkbenchChanges(sheet, ranges) {
  for (const address of ranges) {
    sheet.getRange(address).format = {
      font: { color: "#C00000", bold: true },
      wrapText: true,
      verticalAlignment: "top",
    };
  }
}

async function exportWorkbook(workbook, outputPath) {
  const output = await SpreadsheetFile.exportXlsx(workbook);
  await output.save(outputPath);
}

async function buildSchemaBefore(outputPath, enriched = false) {
  const workbook = Workbook.create();
  const summary = workbook.worksheets.add("資料表總表");
  summary.showGridLines = false;
  summary.getRange("A1:C1").values = [["場景", "資料表名稱", "資料表說明"]];
  summary.getRange("A2:C4").values = [
    [
      "客戶基本資料查詢",
      "DEMO_CRM.CUSTOMER_PROFILE",
      "客戶主檔，記錄客戶基本屬性、會員等級與是否啟用，可用於客群篩選與人數統計。",
    ],
    [
      "訂單交易分析",
      "DEMO_SALES.ORDER_HEADER",
      "訂單主檔，記錄訂單日期、客戶、狀態與金額，可用於銷售趨勢與客戶消費分析。",
    ],
    [
      "商品分類分析",
      "DEMO_SALES.PRODUCT_MASTER",
      "商品主檔，記錄商品分類、商品名稱與啟用狀態，可用於商品維度彙總。",
    ],
  ];
  styleHeader(summary, "A1:C1");
  styleBody(summary, "A2:C4");
  setWidths(summary, [22, 32, 76]);
  summary.freezePanes.freezeRows(1);

  const columns = workbook.worksheets.add("表欄位");
  columns.showGridLines = false;
  columns.getRange("A1:F1").values = [[
    "資料表名稱",
    "欄位標號",
    "欄位名稱",
    "欄位格式",
    "欄位描述",
    "欄位備註",
  ]];
  const rows = [
    [
      "CUSTOMER_PROFILE",
      1,
      "customer_id",
      "varchar(20)",
      "客戶唯一識別碼。",
      "可作為與 ORDER_HEADER.customer_id 關聯的 key；統計客戶數時使用 distinct。",
    ],
    [
      "CUSTOMER_PROFILE",
      2,
      "customer_name",
      "varchar(100)",
      "客戶姓名或顯示名稱。",
      "範例資料為假名；正式資料若含個資，請勿放入 Git。",
    ],
    [
      "CUSTOMER_PROFILE",
      3,
      "segment_code",
      "varchar(20)",
      enriched ? "客戶分群代碼，例如 NEW、ACTIVE、VIP。" : "",
      enriched ? "代碼意義見知識典的 CUSTOMER_SEGMENT；查詢時通常轉成中文名稱顯示。" : "",
    ],
    [
      "CUSTOMER_PROFILE",
      4,
      "signup_date",
      "date",
      "客戶首次註冊日期。",
      "用於新客統計、註冊月份分析與 cohort 分析。",
    ],
    [
      "ORDER_HEADER",
      1,
      "order_id",
      "varchar(30)",
      "訂單唯一識別碼。",
      "統計訂單數時使用 distinct order_id。",
    ],
    [
      "ORDER_HEADER",
      2,
      "customer_id",
      "varchar(20)",
      "下單客戶識別碼。",
      "可關聯 CUSTOMER_PROFILE.customer_id。",
    ],
    [
      "ORDER_HEADER",
      3,
      "order_date",
      "date",
      enriched ? "訂單成立日期。" : "訂單日期。",
      enriched ? "回答月、季、年銷售趨勢時優先使用此欄位作為時間維度。" : "",
    ],
    [
      "ORDER_HEADER",
      4,
      "order_status",
      "varchar(20)",
      enriched ? "訂單狀態代碼，例如 PAID、CANCELLED、REFUNDED。" : "",
      enriched ? "營收分析通常只納入 PAID；取消與退款需依問題語意排除或獨立統計。" : "",
    ],
    [
      "ORDER_HEADER",
      5,
      "net_amount",
      "numeric(12,2)",
      "訂單未稅淨額。",
      "可加總；若問題要求含稅金額，需另找稅額欄位或確認公式。",
    ],
    [
      "PRODUCT_MASTER",
      1,
      "product_id",
      "varchar(30)",
      "商品唯一識別碼。",
      "可關聯訂單明細；此範例未提供訂單明細表。",
    ],
    [
      "PRODUCT_MASTER",
      2,
      "category_code",
      "varchar(20)",
      enriched ? "商品分類代碼，例如 CARD、LOAN、FUND。" : "",
      enriched ? "代碼意義見知識典 PRODUCT_CATEGORY。" : "",
    ],
    [
      "PRODUCT_MASTER",
      3,
      "is_active",
      "boolean",
      "商品是否仍啟用。",
      "若使用者問目前可銷售商品，需篩選 is_active = true。",
    ],
  ];
  columns.getRange(`A2:F${rows.length + 1}`).values = rows;
  styleHeader(columns, "A1:F1");
  styleBody(columns, `A2:F${rows.length + 1}`);
  if (enriched) {
    markWorkbenchChanges(columns, ["E4:F4", "E8:F9", "E12:F12"]);
  }
  setWidths(columns, [24, 10, 24, 18, 44, 72]);
  columns.freezePanes.freezeRows(1);

  await exportWorkbook(workbook, outputPath);
}

async function buildKnowledge() {
  const workbook = Workbook.create();
  const sheet = workbook.worksheets.add("知識典");
  sheet.showGridLines = false;
  sheet.getRange("A1:E1").values = [[
    "主題",
    "代碼或規則",
    "說明",
    "SQL 使用建議",
    "備註",
  ]];
  const rows = [
    [
      "CUSTOMER_SEGMENT",
      "NEW",
      "新客，通常指註冊後 90 天內的客戶。",
      "若問題問新客，優先確認是否以 signup_date 或 segment_code 判斷。",
      "完全假資料範例。",
    ],
    [
      "CUSTOMER_SEGMENT",
      "VIP",
      "高價值客戶。",
      "VIP 人數統計使用 CUSTOMER_PROFILE.segment_code = 'VIP'。",
      "正式門檻需由業務確認。",
    ],
    [
      "ORDER_STATUS",
      "PAID",
      "已付款且可計入營收的訂單。",
      "營收分析預設篩選 ORDER_HEADER.order_status = 'PAID'。",
      "取消與退款不列入營收。",
    ],
    [
      "PRODUCT_CATEGORY",
      "FUND",
      "基金商品分類。",
      "若要依商品類別彙總，需關聯商品主檔取得 category_code。",
      "此範例未提供訂單明細表。",
    ],
  ];
  sheet.getRange(`A2:E${rows.length + 1}`).values = rows;
  styleHeader(sheet, "A1:E1");
  styleBody(sheet, `A2:E${rows.length + 1}`);
  setWidths(sheet, [24, 18, 42, 72, 38]);
  sheet.freezePanes.freezeRows(1);
  await exportWorkbook(workbook, paths.knowledge);
}

async function buildGolden() {
  const workbook = Workbook.create();
  const sheet = workbook.worksheets.add("golden_dataset");
  sheet.showGridLines = false;
  sheet.getRange("A1:D1").values = [[
    "question",
    "correct_postgres_sql",
    "coverage_goal",
    "notes",
  ]];
  const rows = [
    [
      "上個月每個客群的已付款訂單金額是多少？",
      "select c.segment_code, sum(o.net_amount) as paid_net_amount\nfrom demo_sales.order_header o\njoin demo_crm.customer_profile c on o.customer_id = c.customer_id\nwhere o.order_status = 'PAID'\n  and o.order_date >= date_trunc('month', current_date) - interval '1 month'\n  and o.order_date < date_trunc('month', current_date)\ngroup by c.segment_code\norder by paid_net_amount desc;",
      "join、日期區間、狀態篩選、金額加總",
      "使用完全假 schema；正式 SQL 需依實際 schema 調整。",
    ],
    [
      "目前 VIP 客戶有幾位？",
      "select count(distinct customer_id) as vip_customer_count\nfrom demo_crm.customer_profile\nwhere segment_code = 'VIP';",
      "distinct count、代碼欄位",
      "VIP 定義需與知識典一致。",
    ],
    [
      "今年每月已付款訂單數趨勢為何？",
      "select date_trunc('month', order_date)::date as order_month,\n       count(distinct order_id) as paid_order_count\nfrom demo_sales.order_header\nwhere order_status = 'PAID'\n  and order_date >= date_trunc('year', current_date)\ngroup by order_month\norder by order_month;",
      "時間分組、訂單去重、狀態篩選",
      "適合測試時間語意與聚合。",
    ],
  ];
  sheet.getRange(`A2:D${rows.length + 1}`).values = rows;
  styleHeader(sheet, "A1:D1");
  styleBody(sheet, `A2:D${rows.length + 1}`);
  setWidths(sheet, [36, 88, 38, 42]);
  sheet.freezePanes.freezeRows(1);
  await exportWorkbook(workbook, paths.golden);
}

async function buildSchemaAfter() {
  const workbook = Workbook.create();
  const sheet = workbook.worksheets.add("Schema After");
  sheet.showGridLines = false;
  sheet.getRange("A1:F1").values = [[
    "schema",
    "table_name",
    "field",
    "table_description",
    "table_schema",
    "table_summary",
  ]];
  const rows = [
    [
      "demo_crm",
      "CUSTOMER_PROFILE",
      "客戶基本資料查詢",
      "客戶主檔",
      "CREATE TABLE demo_crm.customer_profile (\n  customer_id varchar(20), -- 客戶唯一識別碼\n  customer_name varchar(100), -- 客戶姓名或顯示名稱\n  segment_code varchar(20), -- 客戶分群代碼，例如 NEW、ACTIVE、VIP\n  signup_date date -- 客戶首次註冊日期\n);",
      "客戶主檔，記錄客戶基本屬性、會員等級與是否啟用，可用於客群篩選與人數統計。",
    ],
    [
      "demo_sales",
      "ORDER_HEADER",
      "訂單交易分析",
      "訂單主檔",
      "CREATE TABLE demo_sales.order_header (\n  order_id varchar(30), -- 訂單唯一識別碼\n  customer_id varchar(20), -- 下單客戶識別碼\n  order_date date, -- 訂單成立日期\n  order_status varchar(20), -- 訂單狀態代碼\n  net_amount numeric(12,2) -- 訂單未稅淨額\n);",
      "訂單主檔，記錄訂單日期、客戶、狀態與金額，可用於銷售趨勢與客戶消費分析。",
    ],
    [
      "demo_sales",
      "PRODUCT_MASTER",
      "商品分類分析",
      "商品主檔",
      "CREATE TABLE demo_sales.product_master (\n  product_id varchar(30), -- 商品唯一識別碼\n  category_code varchar(20), -- 商品分類代碼\n  is_active boolean -- 商品是否仍啟用\n);",
      "商品主檔，記錄商品分類、商品名稱與啟用狀態，可用於商品維度彙總。",
    ],
  ];
  sheet.getRange(`A2:F${rows.length + 1}`).values = rows;
  styleHeader(sheet, "A1:F1");
  styleBody(sheet, `A2:F${rows.length + 1}`);
  setWidths(sheet, [18, 24, 22, 28, 90, 72]);
  sheet.freezePanes.freezeRows(1);
  await exportWorkbook(workbook, paths.schemaAfter);
}

await ensureDirs();
const generated = [];
if (process.argv.includes("--workbench-only")) {
  await buildSchemaBefore(paths.workbench, true);
  generated.push(paths.workbench);
} else {
  await buildSchemaBefore(paths.schemaBefore, false);
  await buildSchemaBefore(paths.workbench, true);
  await buildKnowledge();
  await buildGolden();
  await buildSchemaAfter();
  generated.push(...Object.values(paths));
}

for (const output of generated) {
  console.log(output);
}
