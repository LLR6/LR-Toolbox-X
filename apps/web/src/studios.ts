export type StudioId =
  "pdf" | "compress" | "crop" | "ocr" | "word" | "media" | "sql";
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
];
export const studioMatches = (query: string) =>
  studios.filter((s) =>
    [s.id, s.name, s.en, s.intro, s.use, s.engine]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
