export type LegacyStudioId =
  | "pdf"
  | "compress"
  | "crop"
  | "ocr"
  | "word"
  | "media";
export type VisualStudioId =
  | "mermaid"
  | "sheet"
  | "svg"
  | "exif"
  | "heic"
  | "palette"
  | "cron"
  | "password"
  | "snapshot"
  | "datetime";
export type StudioId = LegacyStudioId | VisualStudioId | "sql";

export const visualStudioIds: VisualStudioId[] = [
  "mermaid",
  "sheet",
  "svg",
  "exif",
  "heic",
  "palette",
  "cron",
  "password",
  "snapshot",
  "datetime",
];

export const legacyStudioIds: LegacyStudioId[] = [
  "pdf",
  "compress",
  "crop",
  "ocr",
  "word",
  "media",
];

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
    en: "Mermaid Canvas",
    category: "Diagram",
    intro: "用几行文字，把想法变成结构清晰的图。",
    introEn: "Turn a few lines of text into a clear diagram.",
    use: "流程图 · 时序图 · ER · 类图 · 甘特图 · SVG 导出",
    useEn: "Flow · Sequence · ER · Class · Gantt · SVG export",
    engine: "Mermaid",
    repo: "https://github.com/mermaid-js/mermaid",
    accent: "violet",
  },
  {
    id: "sheet",
    name: "Excel / XLSX 工作台",
    en: "Spreadsheet Studio",
    category: "CSV",
    intro: "打开表格、看数据、转换格式，不必先开 Office。",
    introEn: "Inspect and convert spreadsheets without opening Office.",
    use: "XLSX / XLS · Sheet 预览 · CSV / JSON · 导出",
    useEn: "XLSX / XLS · Sheet preview · CSV / JSON · Export",
    engine: "SheetJS",
    repo: "https://github.com/SheetJS/sheetjs",
    accent: "mint",
  },
  {
    id: "svg",
    name: "SVG 实验室",
    en: "SVG Lab",
    category: "Images",
    intro: "看得见优化前后，也看得见每一字节省在哪里。",
    introEn: "See the SVG and the bytes you saved side by side.",
    use: "实时预览 · SVGO 优化 · 源码对比 · SVG 下载",
    useEn: "Live preview · SVGO · Source compare · SVG export",
    engine: "SVGO",
    repo: "https://github.com/svg/svgo",
    accent: "blue",
  },
  {
    id: "exif",
    name: "照片信息台",
    en: "Photo Metadata",
    category: "Images",
    intro: "一张照片背后的相机、时间和定位信息，一眼看清。",
    introEn: "Reveal the camera, time, and location metadata behind a photo.",
    use: "EXIF · IPTC · XMP · GPS 提醒 · 相机参数",
    useEn: "EXIF · IPTC · XMP · GPS warning · Camera details",
    engine: "ExifReader",
    repo: "https://github.com/mattiasw/ExifReader",
    accent: "coral",
  },
  {
    id: "heic",
    name: "HEIC 图片转换",
    en: "HEIC Converter",
    category: "Images",
    intro: "把 iPhone 照片变成更通用的 JPG 或 PNG。",
    introEn: "Turn iPhone HEIC photos into shareable JPG or PNG files.",
    use: "HEIC / HEIF · JPG / PNG · 质量控制 · 下载",
    useEn: "HEIC / HEIF · JPG / PNG · Quality · Download",
    engine: "heic2any",
    repo: "https://github.com/alexcorvi/heic2any",
    accent: "coral",
  },
  {
    id: "palette",
    name: "图片配色工作室",
    en: "Palette Studio",
    category: "Colors",
    intro: "从一张图里抽出它真正的视觉语言。",
    introEn: "Extract the visual language hiding inside an image.",
    use: "主色 · 色板 · HEX / RGB · CSS Variables · 对比度",
    useEn: "Dominant color · Palette · HEX / RGB · CSS variables · Contrast",
    engine: "Color Thief",
    repo: "https://github.com/lokesh/color-thief",
    accent: "violet",
  },
  {
    id: "cron",
    name: "Cron 时间编排器",
    en: "Cron Planner",
    category: "Time",
    intro: "不用死背星号，把自动任务排成看得懂的时间表。",
    introEn: "Build schedules visually instead of memorizing asterisks.",
    use: "可视化生成 · 表达式校验 · 下 10 次执行时间 · 时区",
    useEn: "Visual builder · Validation · Next 10 runs · Timezone",
    engine: "cron-parser",
    repo: "https://github.com/harrisiirak/cron-parser",
    accent: "blue",
  },
  {
    id: "password",
    name: "密码强度实验室",
    en: "Password Lab",
    category: "Crypto",
    intro: "密码留在本机，用可解释的方式看清它到底弱在哪里。",
    introEn: "Keep passwords local and see exactly where they are weak.",
    use: "强度评分 · 模式识别 · 破解时间估算 · 改进建议",
    useEn: "Score · Pattern analysis · Crack-time estimate · Suggestions",
    engine: "zxcvbn-ts",
    repo: "https://github.com/zxcvbn-ts/zxcvbn",
    accent: "mint",
  },
  {
    id: "snapshot",
    name: "HTML 卡片截图器",
    en: "HTML Snapshot",
    category: "Developer",
    intro: "写一张卡片、海报或代码分享图，然后直接导出 PNG。",
    introEn: "Compose a card, poster, or code share image and export it as PNG.",
    use: "HTML / CSS · 实时画布 · 安全预览 · PNG 导出",
    useEn: "HTML / CSS · Live canvas · Sandboxed preview · PNG export",
    engine: "html2canvas",
    repo: "https://github.com/niklasvh/html2canvas",
    accent: "violet",
  },
  {
    id: "datetime",
    name: "时间日期超级工作台",
    en: "Date & Time Lab",
    category: "Time",
    intro: "时间戳、时区、日期差和下一刻发生什么，都放到一张时间线上。",
    introEn: "Put timestamps, timezones, date differences and conversions on one timeline.",
    use: "Unix · ISO · 时区换算 · 日期差 · 相对时间 · 格式化",
    useEn: "Unix · ISO · Timezones · Date diff · Relative time · Formatting",
    engine: "Day.js",
    repo: "https://github.com/iamkun/dayjs",
    accent: "blue",
  },
];

export const studioMatches = (query: string) =>
  studios.filter((s) =>
    [s.id, s.name, s.en, s.intro, s.use, s.engine]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
