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
  | "resources"
  | "qrread"
  | "calendar";

export type ResearchStudioId = "resources" | "qrread" | "calendar";

export type VisualStudioId = Exclude<
  StudioId,
  | "pdf"
  | "compress"
  | "crop"
  | "ocr"
  | "word"
  | "media"
  | "sql"
  | ResearchStudioId
>;
export type LegacyStudioId = Exclude<
  StudioId,
  VisualStudioId | "sql" | ResearchStudioId
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
    useEn:
      "Strength meter · Pattern analysis · Crack-time estimate · No saving",
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
    id: "resources",
    name: "开源与设备资源库",
    en: "Open Source Resource Lab",
    category: "System",
    intro: "让上传资源和开源灵感，各有清晰的去处。",
    introEn: "A considered home for device packs and open-source discoveries.",
    use: "四份资源 · 本地校验 · POC 文档索引 · 精选开源推荐",
    useEn:
      "Four packs · Local verification · Document index · Open-source picks",
    engine: "Fuse.js + fflate",
    repo: "https://github.com/krisk/Fuse",
    accent: "violet",
  },
  {
    id: "qrread",
    name: "二维码识别台",
    en: "QR Image Reader",
    category: "QR",
    intro: "从图片读出信息，链接由你决定是否打开。",
    introEn: "Read codes from images without opening their links.",
    use: "离线图片识别 · 纯文本结果 · 下载内容",
    useEn: "Offline image decoding · Plain text · Download",
    engine: "jsQR",
    repo: "https://github.com/cozmo/jsQR",
    accent: "mint",
  },
  {
    id: "calendar",
    name: "日历文件台",
    en: "Calendar File Studio",
    category: "Time",
    intro: "把日历文件，变成一目了然的事件表。",
    introEn: "Turn calendar files into a clear event table.",
    use: "ICS 解析 · 时区与重复规则 · JSON 导出",
    useEn: "ICS parsing · Time-zone and recurrence metadata · JSON",
    engine: "ICAL.js",
    repo: "https://github.com/kewisch/ical.js",
    accent: "coral",
  },
];

export const studioMatches = (query: string) =>
  studios.filter((s) =>
    [
      s.id,
      s.name,
      s.en,
      s.intro,
      s.use,
      s.engine,
      ...(studioAliases[s.id] ?? []),
    ].some((value) =>
      value
        .toLowerCase()
        .replace(/\s+/g, "")
        .includes(query.trim().toLowerCase().replace(/\s+/g, "")),
    ),
  );

const studioAliases: Partial<Record<StudioId, string[]>> = {
  resources: [
    "sqlmap",
    "poc",
    "刷机",
    "cpe",
    "开源",
    "github",
    "随身wifi",
    "9008",
  ],
  qrread: ["二维码识别", "识别二维码", "扫码"],
  calendar: ["ics", "日历", "日程"],
  pdf: ["合并pdf", "拆分pdf", "pdf合并", "pdf拆分"],
  compress: ["图片压缩", "压缩图片", "批量压缩"],
  crop: ["裁剪图片", "图片裁剪"],
  ocr: ["截图转文字", "识别文字", "文字识别"],
  word: ["提取word", "word提取"],
  media: ["提取音频", "视频转音频", "制作gif"],
};
export function studioShortcut(query: string) {
  const q = query.trim().toLowerCase().replace(/\s+/g, "");
  if (!q) return undefined;
  return studios.find((s) =>
    [s.id, s.name, s.en, s.engine, ...(studioAliases[s.id] ?? [])].some((v) =>
      v.toLowerCase().replace(/\s+/g, "").includes(q),
    ),
  );
}
