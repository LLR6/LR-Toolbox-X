export type StudioId =
  | "pdf"
  | "compress"
  | "crop"
  | "ocr"
  | "word"
  | "media"
  | "sql"
  | "mermaid"
  | "excel"
  | "svg"
  | "exif"
  | "heic"
  | "palette"
  | "screenshot"
  | "cron"
  | "password"
  | "time"
  | "charts"
  | "math"
  | "barcode"
  | "jwt"
  | "jsonata"
  | "template"
  | "slides"
  | "sqlite";

export type PowerStudioId = Extract<
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
>;
export type LegacyStudioId = Exclude<StudioId, VisualStudioId | "sql">;

export const visualStudioIds: VisualStudioId[] = [
  "mermaid",
  "excel",
  "svg",
  "exif",
  "heic",
  "palette",
  "screenshot",
  "cron",
  "password",
  "time",
];

export const isVisualStudio = (id: StudioId): id is VisualStudioId =>
  visualStudioIds.includes(id as VisualStudioId);

export const studios: {
  id: StudioId;
  name: string;
  en: string;
  category: string;
  intro: string;
  introEn: string;
  use: string;
  useEn: string;
  engine: string;
  repo: string;
  accent: string;
}[] = [
  {
    id: "pdf",
    name: "PDF 整理台",
    en: "PDF Studio",
    category: "PDF",
    intro: "把零散资料，整理成一份完整文件。",
    introEn: "Turn scattered pages into one document.",
    use: "合并 · 提取页面 · 旋转 · 页码与水印",
    useEn: "Merge · Extract · Rotate · Number & watermark",
    engine: "pdf-lib",
    repo: "https://github.com/Hopding/pdf-lib",
    accent: "coral",
  },
  {
    id: "compress",
    name: "图片轻量化",
    en: "Image Compressor",
    category: "Images",
    intro: "画面依旧清晰，文件轻装上阵。",
    introEn: "Keep the picture. Lose the weight.",
    use: "批量压缩 · 缩小尺寸 · JPEG / PNG / WebP",
    useEn: "Batch compression · Resize · JPEG / PNG / WebP",
    engine: "Compressor.js",
    repo: "https://github.com/fengyuanchen/compressorjs",
    accent: "violet",
  },
  {
    id: "crop",
    name: "图片裁剪台",
    en: "Crop Studio",
    category: "Crop",
    intro: "留下你想表达的那一部分。",
    introEn: "Frame the part that matters.",
    use: "拖拽选区 · 固定比例 · 旋转 · 导出 PNG",
    useEn: "Drag selection · Aspect ratio · Rotate · PNG export",
    engine: "Cropper.js",
    repo: "https://github.com/fengyuanchen/cropperjs",
    accent: "mint",
  },
  {
    id: "ocr",
    name: "图片转文字",
    en: "Image to Text",
    category: "OCR",
    intro: "让截图和扫描件，重新变成文字。",
    introEn: "Make screenshots editable again.",
    use: "中文 / 英文识别 · 编辑校对 · TXT 下载",
    useEn: "Chinese / English OCR · Review · TXT export",
    engine: "Tesseract.js",
    repo: "https://github.com/naptha/tesseract.js",
    accent: "blue",
  },
  {
    id: "word",
    name: "Word 内容提取",
    en: "Word Reader",
    category: "Word",
    intro: "提取正文与图片，专注内容本身。",
    introEn: "Bring the contents out of your document.",
    use: "DOCX 排版预览 · 正文提取 · 内嵌图片下载",
    useEn: "DOCX preview · Plain text · Embedded images",
    engine: "Mammoth",
    repo: "https://github.com/mwilliamson/mammoth.js",
    accent: "blue",
  },
  {
    id: "media",
    name: "音视频小工坊",
    en: "Media Studio",
    category: "Media",
    intro: "从一段视频，得到你需要的片段。",
    introEn: "Make a clip, a soundtrack, or a GIF.",
    use: "提取音频 · 截取片段 · 转 MP4 · 制作 GIF",
    useEn: "Extract audio · Trim · MP4 · GIF",
    engine: "ffmpeg.wasm",
    repo: "https://github.com/ffmpegwasm/ffmpeg.wasm",
    accent: "violet",
  },
  {
    id: "sql",
    name: "SQL 整理器",
    en: "SQL Formatter",
    category: "Code",
    intro: "把拥挤的查询语句，变得一目了然。",
    introEn: "Give your queries room to breathe.",
    use: "MySQL · PostgreSQL · SQLite · 统一缩进",
    useEn: "MySQL · PostgreSQL · SQLite · Indentation",
    engine: "SQL Formatter",
    repo: "https://github.com/sql-formatter-org/sql-formatter",
    accent: "mint",
  },
  {
    id: "mermaid",
    name: "Mermaid 图表画布",
    en: "Mermaid Diagram Studio",
    category: "Code",
    intro: "把几行文本，变成可以展示的流程与关系。",
    introEn: "Turn compact text into diagrams you can present.",
    use: "流程图 · 时序图 · ER · 甘特图 · SVG 导出",
    useEn: "Flowchart · Sequence · ER · Gantt · SVG export",
    engine: "Mermaid",
    repo: "https://github.com/mermaid-js/mermaid",
    accent: "violet",
  },
  {
    id: "excel",
    name: "Excel 数据台",
    en: "Excel Data Studio",
    category: "CSV",
    intro: "不用打开 Office，也能快速看懂一张表。",
    introEn: "Inspect a workbook without opening Office.",
    use: "XLS / XLSX / CSV · Sheet 预览 · CSV / JSON / XLSX 导出",
    useEn: "XLS / XLSX / CSV · Sheet preview · CSV / JSON / XLSX export",
    engine: "@stackline/xlsx",
    repo: "https://github.com/stackline/xlsx",
    accent: "mint",
  },
  {
    id: "svg",
    name: "SVG 实验室",
    en: "SVG Lab",
    category: "Colors",
    intro: "让矢量图更干净、更轻，也更容易检查。",
    introEn: "Make vector artwork lighter and easier to inspect.",
    use: "安全预览 · SVGO 优化 · 体积对比 · SVG 导出",
    useEn: "Safe preview · SVGO optimize · Size diff · SVG export",
    engine: "SVGO",
    repo: "https://github.com/svg/svgo",
    accent: "coral",
  },
  {
    id: "exif",
    name: "照片信息台",
    en: "Photo Metadata Studio",
    category: "Images",
    intro: "一眼看懂照片背后的相机、镜头和隐私信息。",
    introEn: "Read the camera, lens, capture and privacy data behind a photo.",
    use: "EXIF · 相机参数 · GPS 隐私提示 · JSON 导出",
    useEn: "EXIF · Camera settings · GPS privacy alert · JSON export",
    engine: "ExifReader",
    repo: "https://github.com/mattiasw/ExifReader",
    accent: "blue",
  },
  {
    id: "heic",
    name: "HEIC 图片转换",
    en: "HEIC Converter",
    category: "Images",
    intro: "把 iPhone 照片，变成到处都能打开的图片。",
    introEn: "Turn iPhone photos into widely compatible images.",
    use: "HEIC / HEIF · JPEG / PNG · 质量控制 · 本地下载",
    useEn: "HEIC / HEIF · JPEG / PNG · Quality · Local download",
    engine: "heic2any",
    repo: "https://github.com/alexcorvi/heic2any",
    accent: "blue",
  },
  {
    id: "palette",
    name: "图片配色工作室",
    en: "Palette Studio",
    category: "Colors",
    intro: "从一张图里，抽出一套真正能用的颜色。",
    introEn: "Pull a usable visual system out of a single image.",
    use: "主色 · 8 色色板 · 语义色 · CSS Variables",
    useEn: "Dominant color · Palette · Semantic swatches · CSS variables",
    engine: "Color Thief",
    repo: "https://github.com/lokesh/color-thief",
    accent: "violet",
  },
  {
    id: "screenshot",
    name: "HTML 卡片截图",
    en: "HTML Card Capture",
    category: "Markdown",
    intro: "把一段本地 HTML，做成可以分享的图片卡片。",
    introEn: "Turn local HTML into a shareable image card.",
    use: "安全 HTML · 卡片尺寸 · 背景 · PNG 导出",
    useEn: "Safe HTML · Card sizes · Background · PNG export",
    engine: "html2canvas",
    repo: "https://github.com/niklasvh/html2canvas",
    accent: "coral",
  },
  {
    id: "cron",
    name: "Cron 时间轴",
    en: "Cron Timeline",
    category: "Time",
    intro: "别再猜表达式下一次到底什么时候运行。",
    introEn: "See exactly when a cron expression will fire next.",
    use: "快捷模板 · 表达式校验 · 时区 · 后续 10 次运行",
    useEn: "Presets · Validation · Time zones · Next 10 runs",
    engine: "cron-parser",
    repo: "https://github.com/harrisiirak/cron-parser",
    accent: "mint",
  },
  {
    id: "password",
    name: "密码强度实验室",
    en: "Password Strength Lab",
    category: "Crypto",
    intro: "不是只看长度，而是识别真实世界里的弱模式。",
    introEn: "Go beyond length and detect real-world weak patterns.",
    use: "强度仪表 · 模式分析 · 破解时间估算 · 不保存密码",
    useEn: "Strength meter · Pattern analysis · Crack-time estimate · No saving",
    engine: "zxcvbn-ts",
    repo: "https://github.com/zxcvbn-ts/zxcvbn",
    accent: "mint",
  },
  {
    id: "time",
    name: "世界时间控制台",
    en: "World Time Console",
    category: "Time",
    intro: "把时区、时间戳和日期差放在同一块时间面板。",
    introEn: "Put zones, timestamps and date differences on one console.",
    use: "时区转换 · Unix / ISO · 日期差 · 世界时间",
    useEn: "Time-zone conversion · Unix / ISO · Date diff · World clocks",
    engine: "Day.js",
    repo: "https://github.com/iamkun/dayjs",
    accent: "violet",
  },
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

];

export const studioMatches = (query: string) =>
  studios.filter((s) =>
    [s.id, s.name, s.en, s.intro, s.use, s.engine]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
