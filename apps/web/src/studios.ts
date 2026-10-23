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
  | "quicktype"
  | "charts"
  | "math"
  | "latex"
  | "lottie"
  | "barcode"
  | "sqlite"
  | "jsondiff"
  | "phone"
  | "chrono";

export type DataUtilityStudioId = Extract<
  StudioId,
  "sqlite" | "jsondiff" | "phone" | "chrono"
>;

export type PowerStudioId = Extract<
  StudioId,
  "quicktype" | "charts" | "math" | "latex" | "lottie" | "barcode"
>;
export type VisualStudioId = Exclude<
  StudioId,
  | "pdf"
  | "compress"
  | "crop"
  | "ocr"
  | "word"
  | "media"
  | "sql"
  | PowerStudioId
  | DataUtilityStudioId
>;
export type LegacyStudioId = Exclude<
  StudioId,
  VisualStudioId | PowerStudioId | DataUtilityStudioId | "sql"
>;

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

export const dataUtilityStudioIds: DataUtilityStudioId[] = [
  "sqlite",
  "jsondiff",
  "phone",
  "chrono",
];

export const powerStudioIds: PowerStudioId[] = [
  "quicktype",
  "charts",
  "math",
  "latex",
  "lottie",
  "barcode",
];

export const isVisualStudio = (id: StudioId): id is VisualStudioId =>
  visualStudioIds.includes(id as VisualStudioId);
export const isPowerStudio = (id: StudioId): id is PowerStudioId =>
  powerStudioIds.includes(id as PowerStudioId);
export const isDataUtilityStudio = (id: StudioId): id is DataUtilityStudioId =>
  dataUtilityStudioIds.includes(id as DataUtilityStudioId);

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
    id: "quicktype",
    name: "JSON → 代码模型",
    en: "JSON to Code Models",
    category: "Code",
    intro: "把一份真实 JSON，直接变成多语言数据模型。",
    introEn: "Turn real JSON into typed models for multiple languages.",
    use: "TypeScript · Python · Go · Java · Rust · Swift",
    useEn: "TypeScript · Python · Go · Java · Rust · Swift",
    engine: "quicktype",
    repo: "https://github.com/glideapps/quicktype",
    accent: "blue",
  },
  {
    id: "charts",
    name: "数据图表工作室",
    en: "Data Chart Studio",
    category: "CSV",
    intro: "贴入 CSV 或 JSON，把数据直接变成可交互图表。",
    introEn: "Turn CSV or JSON into interactive charts locally.",
    use: "柱状图 · 折线图 · 饼图 · PNG 导出",
    useEn: "Bar · Line · Pie · PNG export",
    engine: "Apache ECharts",
    repo: "https://github.com/apache/echarts",
    accent: "coral",
  },
  {
    id: "math",
    name: "数学与矩阵实验室",
    en: "Math & Matrix Lab",
    category: "Time",
    intro: "表达式、复数、单位和矩阵放到同一块计算台。",
    introEn: "Expressions, units, complex values and matrices on one console.",
    use: "表达式 · 行列式 · 逆矩阵 · 转置",
    useEn: "Expressions · Determinant · Inverse · Transpose",
    engine: "Math.js",
    repo: "https://github.com/josdejong/mathjs",
    accent: "mint",
  },
  {
    id: "latex",
    name: "LaTeX 公式排版台",
    en: "LaTeX Formula Studio",
    category: "Markdown",
    intro: "把公式源码立即排成适合报告和分享的成品。",
    introEn: "Typeset formula source into presentation-ready math.",
    use: "KaTeX 预览 · MathML · TEX / PNG 导出",
    useEn: "KaTeX preview · MathML · TEX / PNG export",
    engine: "KaTeX",
    repo: "https://github.com/KaTeX/KaTeX",
    accent: "violet",
  },
  {
    id: "lottie",
    name: "Lottie 动画检查台",
    en: "Lottie Animation Lab",
    category: "Media",
    intro: "打开动画 JSON，立即预览、检查帧数并调速。",
    introEn: "Open Lottie JSON, preview it, inspect timing and change speed.",
    use: "JSON 导入 · SVG 预览 · 播放控制 · 帧信息",
    useEn: "JSON import · SVG preview · Playback · Frame details",
    engine: "lottie-web",
    repo: "https://github.com/airbnb/lottie-web",
    accent: "violet",
  },
  {
    id: "barcode",
    name: "条码生成与识别",
    en: "Barcode Studio",
    category: "QR",
    intro: "常见一维码、二维码生成和图片识别放在同一处。",
    introEn: "Generate and decode common 1D and 2D barcodes in one place.",
    use: "Code128 · EAN13 · QR · Data Matrix · PDF417",
    useEn: "Code128 · EAN13 · QR · Data Matrix · PDF417",
    engine: "BWIP-JS + ZXing",
    repo: "https://github.com/metafloor/bwip-js",
    accent: "blue",
  },
  {
    id: "sqlite",
    name: "SQLite 数据库工作台",
    en: "SQLite Database Studio",
    category: "Code",
    intro: "直接在浏览器里建库、跑 SQL、查看结果并导出真实数据库。",
    introEn: "Build, query and export a real SQLite database entirely in your browser.",
    use: "建表 · 查询 · 聚合 · SQLite 文件导出",
    useEn: "DDL · Queries · Aggregates · SQLite export",
    engine: "sql.js",
    repo: "https://github.com/sql-js/sql.js",
    accent: "mint",
  },
  {
    id: "jsondiff",
    name: "JSON 差异与补丁",
    en: "JSON Diff & Patch",
    category: "Code",
    intro: "不只看哪里变了，还能生成补丁并验证应用后的对象。",
    introEn: "See structural changes, generate a delta and verify the patched object.",
    use: "深层 Diff · 数组变更 · Delta · Patch 验证",
    useEn: "Deep diff · Arrays · Delta · Patch verification",
    engine: "jsondiffpatch",
    repo: "https://github.com/benjamine/jsondiffpatch",
    accent: "coral",
  },
  {
    id: "phone",
    name: "国际手机号解析台",
    en: "International Phone Inspector",
    category: "Text",
    intro: "把各种写法的号码标准化，并检查国家、类型与有效性。",
    introEn: "Normalize phone numbers and inspect country, type and validity.",
    use: "E.164 · 国际格式 · 国家识别 · 类型 · 有效性",
    useEn: "E.164 · International format · Country · Type · Validity",
    engine: "libphonenumber-js",
    repo: "https://github.com/catamphetamine/libphonenumber-js",
    accent: "blue",
  },
  {
    id: "chrono",
    name: "自然语言时间解析",
    en: "Natural Language Date Parser",
    category: "Time",
    intro: "把下周五下午三点这类文字直接识别成真实时间。",
    introEn: "Turn phrases like next Friday at 3pm into actual timestamps.",
    use: "中文 / English · 相对日期 · 时间范围 · ISO 时间线",
    useEn: "Chinese / English · Relative dates · Ranges · ISO timeline",
    engine: "chrono-node",
    repo: "https://github.com/wanasit/chrono",
    accent: "violet",
  },
];

export const studioMatches = (query: string) =>
  studios.filter((s) =>
    [s.id, s.name, s.en, s.intro, s.use, s.engine]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
