from pathlib import Path

studios = Path("apps/web/src/studios.ts")
text = studios.read_text()

if '  | "charts"' not in text:
    text = text.replace(
        '  | "time";',
        '  | "time"\n  | "charts"\n  | "math"\n  | "barcode"\n  | "jwt"\n  | "jsonata"\n  | "template"\n  | "slides"\n  | "sqlite";',
    )

old = '''export type VisualStudioId = Exclude<
  StudioId,
  "pdf" | "compress" | "crop" | "ocr" | "word" | "media" | "sql"
>;'''
new = '''export type PowerStudioId = Extract<
  StudioId,
  "charts" | "math" | "barcode" | "jwt" | "jsonata" | "template" | "slides" | "sqlite"
>;

export const powerStudioIds: PowerStudioId[] = [
  "charts",
  "math",
  "barcode",
  "jwt",
  "jsonata",
  "template",
  "slides",
  "sqlite",
];

export const isPowerStudio = (id: StudioId): id is PowerStudioId =>
  powerStudioIds.includes(id as PowerStudioId);

export type VisualStudioId = Exclude<
  StudioId,
  "pdf" | "compress" | "crop" | "ocr" | "word" | "media" | "sql" | PowerStudioId
>;'''
if old in text:
    text = text.replace(old, new)
elif "export type PowerStudioId" not in text:
    raise SystemExit("VisualStudioId marker not found")

marker = '\n];\n\nexport const studioMatches'
if 'id: "charts"' not in text:
    additions = r'''
  {
    id: "charts",
    name: "数据可视化中心",
    en: "Data Visualization Studio",
    category: "CSV",
    intro: "把一组数据，立即变成可交互、可导出的图表。",
    introEn: "Turn structured data into interactive, exportable charts.",
    use: "柱状图 · 折线图 · 饼图 · PNG 导出",
    useEn: "Bar · Line · Pie · PNG export",
    engine: "Apache ECharts",
    repo: "https://github.com/apache/echarts",
    accent: "blue",
  },
  {
    id: "math",
    name: "数学计算实验室",
    en: "Math Lab",
    category: "Math",
    intro: "从单位换算到矩阵和符号计算，都放进一个计算台。",
    introEn: "Evaluate units, matrices and symbolic expressions in one console.",
    use: "表达式 · 单位 · 矩阵 · 符号求导",
    useEn: "Expressions · Units · Matrices · Symbolic derivatives",
    engine: "Math.js",
    repo: "https://github.com/josdejong/mathjs",
    accent: "violet",
  },
  {
    id: "barcode",
    name: "条形码工作室",
    en: "Barcode Studio",
    category: "Encoding",
    intro: "把编号、商品码和内部标签做成标准条形码。",
    introEn: "Turn identifiers and labels into standard barcodes.",
    use: "CODE128 · EAN · UPC · ITF · SVG 导出",
    useEn: "CODE128 · EAN · UPC · ITF · SVG export",
    engine: "JsBarcode",
    repo: "https://github.com/lindell/JsBarcode",
    accent: "coral",
  },
  {
    id: "jwt",
    name: "JWT / JWK 检查台",
    en: "JWT / JWK Inspector",
    category: "Crypto",
    intro: "看清 Token 的 Header、Payload，并在有密钥时做本地验签。",
    introEn: "Inspect token headers and payloads, and verify locally when a key is supplied.",
    use: "JWT 解码 · HMAC 验签 · 不上传 Token",
    useEn: "JWT decode · HMAC verify · No token upload",
    engine: "panva/jose",
    repo: "https://github.com/panva/jose",
    accent: "mint",
  },
  {
    id: "jsonata",
    name: "JSON 查询转换台",
    en: "JSONata Transform Studio",
    category: "JSON",
    intro: "不是只格式化 JSON，而是直接查询、聚合和重塑数据。",
    introEn: "Query, aggregate and reshape JSON instead of only formatting it.",
    use: "查询 · 过滤 · 聚合 · 数据重塑",
    useEn: "Query · Filter · Aggregate · Reshape",
    engine: "JSONata",
    repo: "https://github.com/jsonata-js/jsonata",
    accent: "blue",
  },
  {
    id: "template",
    name: "模板生成工作台",
    en: "Template Studio",
    category: "Developer",
    intro: "一份模板加一份 JSON，批量生成结构化文本或 HTML。",
    introEn: "Combine a template with JSON to generate structured text or HTML.",
    use: "Handlebars · JSON 数据 · 安全预览 · HTML 导出",
    useEn: "Handlebars · JSON data · Safe preview · HTML export",
    engine: "Handlebars",
    repo: "https://github.com/handlebars-lang/handlebars.js",
    accent: "violet",
  },
  {
    id: "slides",
    name: "浏览器演示工坊",
    en: "Browser Slides Studio",
    category: "Markdown",
    intro: "用 Markdown 快速搭一份真正可播放的网页演示稿。",
    introEn: "Build a real browser presentation from compact Markdown.",
    use: "Markdown 分页 · Reveal 播放 · 进度与控制 · 源码导出",
    useEn: "Markdown slides · Reveal playback · Controls · Source export",
    engine: "Reveal.js",
    repo: "https://github.com/hakimel/reveal.js",
    accent: "coral",
  },
  {
    id: "sqlite",
    name: "SQLite 本地数据库",
    en: "SQLite Browser Lab",
    category: "Developer",
    intro: "直接在浏览器内存里打开、查询和导出 SQLite 数据库。",
    introEn: "Open, query and export SQLite databases entirely in browser memory.",
    use: "打开 DB · 执行 SQL · 表格预览 · 数据库导出",
    useEn: "Open DB · Run SQL · Table preview · Database export",
    engine: "sql.js",
    repo: "https://github.com/sql-js/sql.js",
    accent: "mint",
  },
'''
    if marker not in text:
        raise SystemExit("studios array marker not found")
    text = text.replace(marker, additions + marker)
studios.write_text(text)

router = Path("apps/web/src/StudioWorkspace.tsx")
r = router.read_text()
if "isPowerStudio" not in r:
    r = r.replace(
        'import { isVisualStudio, type LegacyStudioId, type StudioId } from "./studios.ts";',
        'import { isPowerStudio, isVisualStudio, type LegacyStudioId, type StudioId } from "./studios.ts";',
    )
    r = r.replace(
        'import { VisualStudioWorkspace } from "./VisualStudioWorkspace.tsx";',
        'import { VisualStudioWorkspace } from "./VisualStudioWorkspace.tsx";\nimport { PowerStudioWorkspace } from "./PowerStudioWorkspace.tsx";',
    )
    r = r.replace(
        'export function StudioWorkspace(props: Props) {\n  if (isVisualStudio(props.id)) {',
        'export function StudioWorkspace(props: Props) {\n  if (isPowerStudio(props.id)) {\n    return <PowerStudioWorkspace {...props} id={props.id} />;\n  }\n  if (isVisualStudio(props.id)) {',
    )
router.write_text(r)

power = Path("apps/web/src/PowerStudioWorkspace.tsx")
p = power.read_text()
if 'import "reveal.js/dist/reveal.css";' not in p:
    p = p.replace('import "./power-studios.css";', 'import "reveal.js/dist/reveal.css";\nimport "./power-studios.css";')
power.write_text(p)

notices = Path("THIRD_PARTY_NOTICES.md")
n = notices.read_text()
heading = "## v0.11 data and developer studios"
if heading not in n:
    n += '''\n\n## v0.11 data and developer studios\n\n- `echarts` 6.1.0 — Apache-2.0; local interactive chart rendering. https://github.com/apache/echarts\n- `mathjs` 15.2.0 — Apache-2.0; expression, unit, matrix and symbolic math engine. https://github.com/josdejong/mathjs\n- `jsbarcode` 3.12.3 — MIT; local SVG barcode generation. https://github.com/lindell/JsBarcode\n- `jose` 6.2.13 — MIT; local JWT/JWS decoding and cryptographic verification. https://github.com/panva/jose\n- `jsonata` 2.2.2 — MIT; JSON query and transformation language. https://github.com/jsonata-js/jsonata\n- `handlebars` 4.7.9 — MIT; local structured template rendering. https://github.com/handlebars-lang/handlebars.js\n- `reveal.js` 6.0.2 — MIT; embedded browser presentation engine. https://github.com/hakimel/reveal.js\n- `sql.js` 1.15.1 — MIT; SQLite compiled to WebAssembly/JavaScript for local in-memory databases. https://github.com/sql-js/sql.js\n'''
notices.write_text(n)
