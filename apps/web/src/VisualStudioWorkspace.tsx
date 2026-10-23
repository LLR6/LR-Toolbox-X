import { useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { studios, type VisualStudioId } from "./studios.ts";
import { ToolIcon, UiIcon } from "./Icons.tsx";
import { download, downloadBlob } from "./storage.ts";
import "./visual-studios.css";

type Status = "success" | "error";
type PasswordReport = {
  score: number;
  guessesLog10: number;
  warning: string;
  suggestions: string[];
  patterns: string[];
};
type TimeReport = {
  iso: string;
  unix: number;
  millis: number;
  target: string;
  diffMinutes: number;
  diffHours: number;
  diffDays: number;
};
type ExifSummary = Record<string, string>;
type PaletteColor = {
  hex: () => string;
  css: () => string;
};

const MERMAID_EXAMPLE = `flowchart LR
  A[Idea] --> B{Ready?}
  B -->|Yes| C[Build]
  B -->|No| D[Refine]
  D --> A
  C --> E[Ship]`;
const SVG_EXAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 260">
  <defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#7187ff"/><stop offset="1" stop-color="#b06ce7"/></linearGradient></defs>
  <rect width="560" height="260" rx="32" fill="#151e34"/>
  <circle cx="130" cy="130" r="72" fill="url(#g)"/>
  <text x="235" y="122" fill="#f3f6ff" font-size="34" font-family="system-ui" font-weight="700">LR Toolbox X</text>
  <text x="235" y="160" fill="#9fb0ce" font-size="18" font-family="system-ui">local-first visual studio</text>
</svg>`;
const CARD_EXAMPLE = `<div style="padding:42px;border-radius:28px;background:linear-gradient(135deg,#263963,#171f35);color:#f5f7ff;font-family:system-ui;box-shadow:0 25px 70px #05091455">
  <div style="font-size:12px;letter-spacing:.18em;color:#98a9ce">LR TOOLBOX X / SHARE CARD</div>
  <h1 style="font-size:38px;margin:18px 0 12px">Make small things effortless.</h1>
  <p style="font-size:18px;line-height:1.7;color:#c2cce1;margin:0">Local tools, visual workspaces, and fewer repetitive steps.</p>
</div>`;

function useBlobUrl(blob: Blob | undefined) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!blob) {
      setUrl("");
      return;
    }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);
  return url;
}

function bytes(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

function imageFromFile(file: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(Error("Image decode failed"));
    };
    image.src = url;
  });
}

function friendlyDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds > 3155760000) return "centuries";
  if (seconds < 1) return "< 1 second";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31557600) return `${Math.round(seconds / 86400)} days`;
  return `${Math.round(seconds / 31557600)} years`;
}

async function svgToPng(svg: string, name: string) {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const node = new Image();
      node.onload = () => resolve(node);
      node.onerror = () => reject(Error("SVG preview could not be rasterized"));
      node.src = url;
    });
    const width = Math.max(1, Math.min(2400, image.naturalWidth || 1600));
    const height = Math.max(1, Math.min(1800, image.naturalHeight || 900));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw Error("Canvas unavailable");
    context.drawImage(image, 0, 0, width, height);
    const png = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) => (value ? resolve(value) : reject(Error("PNG export failed"))),
        "image/png",
      ),
    );
    downloadBlob(name, png);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function tagText(tags: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const raw = tags[key];
    if (!raw || typeof raw !== "object") continue;
    const candidate = raw as { description?: unknown; value?: unknown };
    if (candidate.description !== undefined) return String(candidate.description);
    if (candidate.value !== undefined) return String(candidate.value);
  }
  return "";
}

export function VisualStudioWorkspace({
  id,
  en,
  onClose,
  onRecord,
}: {
  id: VisualStudioId;
  en: boolean;
  onClose: () => void;
  onRecord: (id: string, status: Status, ms: number) => void;
}) {
  const meta = studios.find((studio) => studio.id === id)!;
  const t = (zh: string, english: string) => (en ? english : zh);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [mermaidSource, setMermaidSource] = useState(MERMAID_EXAMPLE);
  const [mermaidSvg, setMermaidSvg] = useState("");

  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [sheetName, setSheetName] = useState("");
  const [excelRows, setExcelRows] = useState<unknown[][]>([]);

  const [svgSource, setSvgSource] = useState(SVG_EXAMPLE);
  const [svgOutput, setSvgOutput] = useState("");
  const [svgStats, setSvgStats] = useState({ before: 0, after: 0 });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoUrl = useBlobUrl(photoFile ?? undefined);
  const [exif, setExif] = useState<ExifSummary>({});
  const [hasGps, setHasGps] = useState(false);

  const [heicFile, setHeicFile] = useState<File | null>(null);
  const [heicFormat, setHeicFormat] = useState("image/jpeg");
  const [heicQuality, setHeicQuality] = useState(0.88);
  const [heicOutputs, setHeicOutputs] = useState<Blob[]>([]);
  const heicUrl = useBlobUrl(heicOutputs[0]);

  const [paletteFile, setPaletteFile] = useState<File | null>(null);
  const paletteUrl = useBlobUrl(paletteFile ?? undefined);
  const [palette, setPalette] = useState<string[]>([]);

  const [cardSource, setCardSource] = useState(CARD_EXAMPLE);
  const [cardWidth, setCardWidth] = useState(900);
  const [cardBackground, setCardBackground] = useState("#10192c");
  const cardRef = useRef<HTMLDivElement>(null);

  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const zones = useMemo(
    () =>
      [...new Set([localZone, "UTC", "Asia/Shanghai", "America/Los_Angeles", "Europe/London", "Asia/Tokyo"])],
    [localZone],
  );
  const [cronExpression, setCronExpression] = useState("0 9 * * 1-5");
  const [cronZone, setCronZone] = useState(localZone);
  const [cronRuns, setCronRuns] = useState<string[]>([]);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordReport, setPasswordReport] = useState<PasswordReport | null>(null);

  const [timeStart, setTimeStart] = useState(new Date().toISOString());
  const [timeEnd, setTimeEnd] = useState(
    new Date(Date.now() + 86400000).toISOString(),
  );
  const [targetZone, setTargetZone] = useState("Asia/Shanghai");
  const [timeReport, setTimeReport] = useState<TimeReport | null>(null);

  useEffect(() => {
    if (id !== "screenshot" || !cardRef.current) return;
    const host = cardRef.current;
    if (/url\s*\(/i.test(cardSource)) {
      host.replaceChildren();
      const note = document.createElement("p");
      note.textContent = t(
        "为避免远程资源请求，卡片 HTML 不允许 CSS url()。",
        "CSS url() is blocked so the card cannot request remote resources.",
      );
      host.append(note);
      return;
    }
    const fragment = DOMPurify.sanitize(cardSource, {
      RETURN_DOM_FRAGMENT: true,
      FORBID_TAGS: ["script", "iframe", "object", "embed", "link", "img", "video", "audio", "form"],
      FORBID_ATTR: ["src", "href", "srcset", "onload", "onclick", "onerror"],
    });
    host.replaceChildren(fragment);
  }, [id, cardSource, en]);

  async function perform(task: () => Promise<void>) {
    if (busy) return;
    const started = performance.now();
    let status: Status = "success";
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await task();
    } catch (caught) {
      status = "error";
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setBusy(false);
      onRecord(`studio.${id}`, status, Math.round(performance.now() - started));
    }
  }

  async function renderMermaid() {
    await perform(async () => {
      if (mermaidSource.length > 30000) throw Error(t("图表源码最多 3 万字符", "Diagram source is limited to 30,000 characters"));
      const { default: mermaid } = await import("mermaid");
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        htmlLabels: false,
        theme: "base",
        themeVariables: {
          background: "#121a2c",
          primaryColor: "#26385f",
          primaryTextColor: "#f3f6ff",
          primaryBorderColor: "#8296e8",
          lineColor: "#98a8cb",
          secondaryColor: "#263348",
          tertiaryColor: "#19243a",
        },
      });
      const { svg } = await mermaid.render(`lrx-${Date.now()}`, mermaidSource);
      setMermaidSvg(svg);
      setNotice(t("图表已在本地渲染。", "Diagram rendered locally."));
    });
  }

  async function readExcel(file: File, requested?: string) {
    if (file.size > 10000000) throw Error(t("表格最大 10 MB", "Spreadsheet limit is 10 MB"));
    const XLSX = await import("@stackline/xlsx");
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: "array", cellDates: true, sheetRows: 5000 });
    const names = workbook.SheetNames.slice(0, 30);
    if (!names.length) throw Error(t("没有找到工作表", "No worksheets found"));
    const selected = requested && names.includes(requested) ? requested : names[0];
    const sheet = workbook.Sheets[selected];
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      defval: "",
      blankrows: false,
    }) as unknown[][];
    setSheetNames(names);
    setSheetName(selected);
    setExcelRows(rows.slice(0, 200).map((row) => row.slice(0, 40)));
    setNotice(
      t(
        `已读取 ${names.length} 个 Sheet；预览最多 200 行 × 40 列。`,
        `${names.length} sheets loaded; preview is capped at 200 rows × 40 columns.`,
      ),
    );
  }

  async function selectExcel(file: File | undefined) {
    if (!file) return;
    await perform(async () => {
      if (!/\.(xlsx|xls|csv)$/i.test(file.name)) throw Error(t("请选择 XLS、XLSX 或 CSV", "Choose XLS, XLSX or CSV"));
      setExcelFile(file);
      await readExcel(file);
    });
  }

  async function exportExcel(kind: "csv" | "json" | "xlsx") {
    if (!excelFile || !sheetName) return;
    await perform(async () => {
      const XLSX = await import("@stackline/xlsx");
      const workbook = XLSX.read(new Uint8Array(await excelFile.arrayBuffer()), {
        type: "array",
        cellDates: true,
      });
      const sheet = workbook.Sheets[sheetName];
      if (kind === "csv") {
        download(`${sheetName}.csv`, XLSX.utils.sheet_to_csv(sheet), "text/csv;charset=utf-8");
        return;
      }
      if (kind === "json") {
        download(
          `${sheetName}.json`,
          JSON.stringify(XLSX.utils.sheet_to_json(sheet, { defval: null }), null, 2),
          "application/json;charset=utf-8",
        );
        return;
      }
      const one = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(one, sheet, sheetName.slice(0, 31));
      const output = XLSX.write(one, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
      downloadBlob(`${sheetName}.xlsx`, new Blob([output], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    });
  }

  async function optimizeSvg() {
    await perform(async () => {
      if (bytes(svgSource) > 2000000) throw Error(t("SVG 最大 2 MB", "SVG limit is 2 MB"));
      const safe = DOMPurify.sanitize(svgSource, {
        USE_PROFILES: { svg: true, svgFilters: true },
        FORBID_TAGS: ["script", "foreignObject"],
        FORBID_ATTR: ["onload", "onclick", "onerror", "href", "xlink:href"],
      });
      if (!safe.includes("<svg")) throw Error(t("没有找到有效 SVG", "No valid SVG found"));
      const { optimize } = await import("svgo");
      const result = optimize(safe, { multipass: true });
      setSvgOutput(result.data);
      setSvgStats({ before: bytes(svgSource), after: bytes(result.data) });
      setNotice(t("已安全清理并优化 SVG。", "SVG sanitized and optimized."));
    });
  }

  async function selectExif(file: File | undefined) {
    if (!file) return;
    await perform(async () => {
      if (file.size > 15000000) throw Error(t("照片最大 15 MB", "Photo limit is 15 MB"));
      const { default: ExifReader } = await import("exifreader");
      const tags = ExifReader.load(await file.arrayBuffer()) as Record<string, unknown>;
      const summary: ExifSummary = {
        [t("文件", "File")]: file.name,
        [t("相机厂商", "Camera make")]: tagText(tags, ["Make"]),
        [t("相机型号", "Camera model")]: tagText(tags, ["Model"]),
        [t("镜头", "Lens")]: tagText(tags, ["LensModel", "Lens"]),
        [t("拍摄时间", "Captured")]: tagText(tags, ["DateTimeOriginal", "CreateDate", "DateTime"]),
        [t("光圈", "Aperture")]: tagText(tags, ["FNumber", "ApertureValue"]),
        [t("快门", "Shutter")]: tagText(tags, ["ExposureTime", "ShutterSpeedValue"]),
        ISO: tagText(tags, ["ISOSpeedRatings", "PhotographicSensitivity", "ISO"]),
        [t("焦距", "Focal length")]: tagText(tags, ["FocalLength"]),
        [t("宽度", "Width")]: tagText(tags, ["Image Width", "PixelXDimension", "ExifImageWidth"]),
        [t("高度", "Height")]: tagText(tags, ["Image Height", "PixelYDimension", "ExifImageHeight"]),
        [t("纬度", "Latitude")]: tagText(tags, ["GPSLatitude"]),
        [t("经度", "Longitude")]: tagText(tags, ["GPSLongitude"]),
      };
      setPhotoFile(file);
      setExif(Object.fromEntries(Object.entries(summary).filter(([, value]) => value)));
      setHasGps(Boolean(summary[t("纬度", "Latitude")] || summary[t("经度", "Longitude")]));
      setNotice(t("元数据只在浏览器本地读取。", "Metadata was read locally in your browser."));
    });
  }

  async function convertHeic() {
    if (!heicFile) return;
    await perform(async () => {
      if (heicFile.size > 20000000) throw Error(t("HEIC 最大 20 MB", "HEIC limit is 20 MB"));
      const { default: heic2any } = await import("heic2any");
      const converted = await heic2any({
        blob: heicFile,
        toType: heicFormat,
        quality: heicQuality,
      });
      const list = Array.isArray(converted) ? converted : [converted];
      setHeicOutputs(list.slice(0, 20));
      setNotice(
        t(
          `转换完成，共 ${list.length} 张；转换结果不会保留原 HEIC 元数据。`,
          `Converted ${list.length} image(s). HEIC metadata is not preserved in the output.`,
        ),
      );
    });
  }

  async function extractPalette() {
    if (!paletteFile) return;
    await perform(async () => {
      if (paletteFile.size > 12000000) throw Error(t("图片最大 12 MB", "Image limit is 12 MB"));
      const image = await imageFromFile(paletteFile);
      const { getPaletteSync } = await import("colorthief");
      const colors = getPaletteSync(image, { colorCount: 8 }) as unknown as PaletteColor[];
      const values = colors.slice(0, 8).map((color) => color.hex().toUpperCase());
      if (!values.length) throw Error(t("没有提取到颜色", "No colors could be extracted"));
      setPalette(values);
      setNotice(t("已生成 8 色本地色板。", "Local 8-color palette generated."));
    });
  }

  async function captureCard() {
    if (!cardRef.current) return;
    await perform(async () => {
      if (/url\s*\(/i.test(cardSource)) throw Error(t("不允许 CSS url() 外部资源", "CSS url() resources are blocked"));
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current!, {
        backgroundColor: cardBackground,
        scale: 2,
        logging: false,
        useCORS: false,
        allowTaint: false,
      });
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((value) => (value ? resolve(value) : reject(Error("PNG export failed"))), "image/png"),
      );
      downloadBlob("LR-card.png", blob);
      setNotice(t("PNG 卡片已生成。", "PNG card generated."));
    });
  }

  async function parseCron() {
    await perform(async () => {
      const { CronExpressionParser } = await import("cron-parser");
      const interval = CronExpressionParser.parse(cronExpression.trim(), {
        currentDate: new Date(),
        tz: cronZone,
      });
      setCronRuns(interval.take(10).map((value) => value.toString()));
      setNotice(t("表达式有效，已计算后续 10 次运行。", "Expression is valid; next 10 runs calculated."));
    });
  }

  async function checkPassword() {
    await perform(async () => {
      if (!password) throw Error(t("先输入一个待检查密码", "Enter a password to check"));
      if (password.length > 256) throw Error(t("密码最多 256 个字符", "Password is limited to 256 characters"));
      const [{ ZxcvbnFactory }, common] = await Promise.all([
        import("@zxcvbn-ts/core"),
        import("@zxcvbn-ts/language-common"),
      ]);
      const checker = new ZxcvbnFactory({ ...common });
      const result = checker.check(password);
      setPasswordReport({
        score: result.score,
        guessesLog10: result.guessesLog10,
        warning: result.feedback.warning || "",
        suggestions: result.feedback.suggestions || [],
        patterns: [...new Set(result.sequence.map((item) => item.pattern))].slice(0, 8),
      });
      setNotice(t("密码不会写入历史或本地存储。", "The password is never written to history or local storage."));
    });
  }

  async function calculateTime() {
    await perform(async () => {
      const { default: dayjs } = await import("dayjs");
      const start = dayjs(timeStart);
      const end = dayjs(timeEnd);
      if (!start.isValid() || !end.isValid()) throw Error(t("请输入有效 ISO 日期时间", "Enter valid ISO date-times"));
      const instant = start.toDate();
      const target = new Intl.DateTimeFormat(en ? "en-US" : "zh-CN", {
        timeZone: targetZone,
        dateStyle: "full",
        timeStyle: "long",
      }).format(instant);
      const diffMinutes = end.diff(start, "minute", true);
      setTimeReport({
        iso: start.toISOString(),
        unix: start.unix(),
        millis: start.valueOf(),
        target,
        diffMinutes,
        diffHours: diffMinutes / 60,
        diffDays: diffMinutes / 1440,
      });
      setNotice(t("时间计算完成。", "Time calculation complete."));
    });
  }

  const safeMermaidDoc = mermaidSvg
    ? `<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'"><style>html,body{margin:0;min-height:100%;display:grid;place-items:center;background:#121a2c;color:#fff}svg{max-width:96%;height:auto}</style>${mermaidSvg}`
    : "";
  const safeSvgDoc = svgOutput
    ? `<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'"><style>html,body{margin:0;min-height:100%;display:grid;place-items:center;background:#121a2c}svg{max-width:94%;max-height:94vh}</style>${svgOutput}`
    : "";
  const cssPalette = palette
    .map((color, index) => `--lr-${["primary", "accent", "surface", "highlight", "muted", "support", "detail", "ink"][index]}: ${color};`)
    .join("\n");
  const scoreLabels = [
    t("很弱", "Very weak"),
    t("弱", "Weak"),
    t("一般", "Fair"),
    t("强", "Strong"),
    t("很强", "Very strong"),
  ];
  const worldZones = [localZone, "UTC", "Asia/Shanghai", "America/Los_Angeles", "Europe/London"].filter(
    (value, index, list) => list.indexOf(value) === index,
  );

  return (
    <section className={`visual-studio visual-${id}`} aria-label={meta.en}>
      <button className="studio-back" aria-label="Close tool" onClick={onClose} disabled={busy}>
        ← {t("返回工作台", "Back to studios")}
      </button>
      <div className="visual-hero">
        <div className="visual-hero-icon"><ToolIcon category={meta.category} /></div>
        <div>
          <span className="studio-kicker">LR SPECIALIST WORKSPACE / {id.toUpperCase()}</span>
          <h1>{en ? meta.en : meta.name}</h1>
          <p>{en ? meta.introEn : meta.intro}</p>
        </div>
        <a href={meta.repo} target="_blank" rel="noreferrer">{meta.engine} ↗</a>
      </div>

      {error && <div className="studio-error visual-error" role="alert">{error}</div>}
      {notice && <div className="visual-notice" role="status">{notice}</div>}

      {id === "mermaid" && (
        <div className="visual-split mermaid-layout">
          <section className="visual-panel visual-editor">
            <div className="visual-panel-head"><strong>DIAGRAM SOURCE</strong><span>Mermaid</span></div>
            <textarea aria-label="Mermaid source" value={mermaidSource} onChange={(event) => setMermaidSource(event.target.value)} rows={20} spellCheck={false} />
            <div className="visual-actions">
              <button className="studio-primary" disabled={busy} onClick={() => void renderMermaid()}>{busy ? t("渲染中…", "Rendering…") : t("渲染图表", "Render diagram")} →</button>
              <button onClick={() => setMermaidSource(MERMAID_EXAMPLE)}>{t("恢复示例", "Reset example")}</button>
            </div>
          </section>
          <section className="visual-panel visual-canvas">
            <div className="visual-panel-head"><strong>LIVE CANVAS</strong><span>STRICT SANDBOX</span></div>
            {mermaidSvg ? (
              <>
                <iframe title="Mermaid preview" sandbox="" referrerPolicy="no-referrer" srcDoc={safeMermaidDoc} />
                <div className="visual-actions">
                  <button onClick={() => download("LR-diagram.svg", mermaidSvg, "image/svg+xml;charset=utf-8")}>SVG ↓</button>
                  <button onClick={() => void svgToPng(mermaidSvg, "LR-diagram.png")}>PNG ↓</button>
                </div>
              </>
            ) : <div className="visual-empty"><ToolIcon category="Code" /><strong>{t("写下关系，生成图表。", "Write the relationships. Render the diagram.")}</strong></div>}
          </section>
        </div>
      )}

      {id === "excel" && (
        <div className="visual-stack excel-layout">
          <section className="visual-panel excel-toolbar">
            <label className="visual-file-picker"><UiIcon name="upload" /><span><strong>{t("打开 XLS / XLSX / CSV", "Open XLS / XLSX / CSV")}</strong><small>{t("最大 10 MB；只在本地解析", "10 MB max; parsed locally")}</small></span><input aria-label="Excel file" type="file" accept=".xls,.xlsx,.csv" onChange={(event) => void selectExcel(event.target.files?.[0])} /></label>
            {!!sheetNames.length && <div className="sheet-tabs">{sheetNames.map((name) => <button key={name} className={sheetName === name ? "active" : ""} onClick={() => excelFile && void perform(() => readExcel(excelFile, name))}>{name}</button>)}</div>}
            {!!sheetName && <div className="visual-actions"><button onClick={() => void exportExcel("csv")}>CSV ↓</button><button onClick={() => void exportExcel("json")}>JSON ↓</button><button onClick={() => void exportExcel("xlsx")}>XLSX ↓</button></div>}
          </section>
          <section className="visual-panel spreadsheet-shell">
            {excelRows.length ? <div className="spreadsheet-scroll"><table><tbody>{excelRows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => rowIndex === 0 ? <th key={cellIndex}>{String(cell ?? "")}</th> : <td key={cellIndex}>{String(cell ?? "")}</td>)}</tr>)}</tbody></table></div> : <div className="visual-empty"><ToolIcon category="CSV" /><strong>{t("打开一张表，Sheet 会铺在这里。", "Open a workbook and its sheet will unfold here.")}</strong></div>}
          </section>
        </div>
      )}

      {id === "svg" && (
        <div className="visual-split svg-layout">
          <section className="visual-panel visual-editor"><div className="visual-panel-head"><strong>SVG SOURCE</strong><span>{(bytes(svgSource) / 1024).toFixed(1)} KB</span></div><textarea aria-label="SVG source" value={svgSource} onChange={(event) => setSvgSource(event.target.value)} rows={20} spellCheck={false} /><label className="inline-upload">{t("或加载 SVG 文件", "Or load an SVG file")}<input type="file" accept=".svg,image/svg+xml" onChange={(event) => { const file = event.target.files?.[0]; if (file && file.size <= 2000000) void file.text().then(setSvgSource); }} /></label><div className="visual-actions"><button className="studio-primary" disabled={busy} onClick={() => void optimizeSvg()}>{t("安全清理并优化", "Sanitize & optimize")} →</button></div></section>
          <section className="visual-panel visual-canvas"><div className="visual-panel-head"><strong>OPTIMIZED OUTPUT</strong><span>{svgStats.after ? `${((1 - svgStats.after / svgStats.before) * 100).toFixed(1)}% ${t("更小", "smaller")}` : "SVGO"}</span></div>{svgOutput ? <><iframe title="SVG optimized preview" sandbox="" referrerPolicy="no-referrer" srcDoc={safeSvgDoc} /><div className="size-meter"><span>{t("优化前", "Before")} {(svgStats.before / 1024).toFixed(1)} KB</span><i style={{ width: `${Math.max(4, Math.min(100, (svgStats.after / svgStats.before) * 100))}%` }} /><span>{t("优化后", "After")} {(svgStats.after / 1024).toFixed(1)} KB</span></div><div className="visual-actions"><button onClick={() => download("LR-optimized.svg", svgOutput, "image/svg+xml;charset=utf-8")}>SVG ↓</button><button onClick={() => void svgToPng(svgOutput, "LR-optimized.png")}>PNG ↓</button></div></> : <div className="visual-empty"><ToolIcon category="Colors" /><strong>{t("优化后的矢量图会安全预览在这里。", "The optimized vector will preview safely here.")}</strong></div>}</section>
        </div>
      )}

      {id === "exif" && (
        <div className="visual-split exif-layout">
          <section className="visual-panel photo-stage"><label className="visual-file-picker"><UiIcon name="upload" /><span><strong>{t("选择照片", "Choose a photo")}</strong><small>JPEG · PNG · WebP · HEIC · AVIF</small></span><input aria-label="Photo metadata file" type="file" accept="image/*,.heic,.heif,.avif" onChange={(event) => void selectExif(event.target.files?.[0])} /></label>{photoUrl && <img src={photoUrl} alt={t("照片预览", "Photo preview")} />}{hasGps && <div className="privacy-alert">⌖ {t("这张照片包含 GPS 位置信息；公开分享前请留意隐私。", "This photo contains GPS location data. Review it before sharing publicly.")}</div>}</section>
          <section className="visual-panel exif-cards"><div className="visual-panel-head"><strong>PHOTO DATA</strong><span>LOCAL READ</span></div>{Object.keys(exif).length ? <><div className="metadata-grid">{Object.entries(exif).map(([key, value]) => <article key={key}><small>{key}</small><strong>{value}</strong></article>)}</div><div className="visual-actions"><button onClick={() => download("LR-photo-metadata.json", JSON.stringify(exif, null, 2), "application/json;charset=utf-8")}>JSON ↓</button></div></> : <div className="visual-empty"><ToolIcon category="Images" /><strong>{t("相机与拍摄参数会整理成卡片。", "Camera and capture details will become readable cards.")}</strong></div>}</section>
        </div>
      )}

      {id === "heic" && (
        <div className="visual-split heic-layout">
          <section className="visual-panel"><label className="visual-file-picker"><UiIcon name="upload" /><span><strong>{t("选择 HEIC / HEIF", "Choose HEIC / HEIF")}</strong><small>{t("最大 20 MB，本地转换", "20 MB max, local conversion")}</small></span><input aria-label="HEIC file" type="file" accept=".heic,.heif,image/heic,image/heif" onChange={(event) => { setHeicFile(event.target.files?.[0] ?? null); setHeicOutputs([]); }} /></label><div className="control-grid"><label>{t("输出格式", "Format")}<select value={heicFormat} onChange={(event) => setHeicFormat(event.target.value)}><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option></select></label><label>{t("JPEG 质量", "JPEG quality")} {Math.round(heicQuality * 100)}%<input type="range" min="0.4" max="1" step="0.02" value={heicQuality} onChange={(event) => setHeicQuality(Number(event.target.value))} disabled={heicFormat !== "image/jpeg"} /></label></div><button className="studio-primary" disabled={!heicFile || busy} onClick={() => void convertHeic()}>{busy ? t("转换中…", "Converting…") : t("转换图片", "Convert image")} →</button><p className="visual-tip">{t("注意：heic2any 不会把原始 EXIF / GPS 元数据复制到输出图片。", "Note: heic2any does not copy original EXIF/GPS metadata into converted files.")}</p></section>
          <section className="visual-panel heic-preview">{heicUrl ? <><img src={heicUrl} alt="HEIC converted preview" /><div className="visual-actions">{heicOutputs.map((blob, index) => <button key={index} onClick={() => downloadBlob(`LR-HEIC-${index + 1}.${heicFormat === "image/png" ? "png" : "jpg"}`, blob)}>{t("下载", "Download")} {index + 1} ↓</button>)}</div></> : <div className="visual-empty"><ToolIcon category="Images" /><strong>{t("兼容格式的预览会出现在这里。", "The compatible image preview will appear here.")}</strong></div>}</section>
        </div>
      )}

      {id === "palette" && (
        <div className="visual-split palette-layout">
          <section className="visual-panel photo-stage"><label className="visual-file-picker"><UiIcon name="upload" /><span><strong>{t("选择参考图片", "Choose a reference image")}</strong><small>JPEG · PNG · WebP</small></span><input aria-label="Palette image" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { setPaletteFile(event.target.files?.[0] ?? null); setPalette([]); }} /></label>{paletteUrl && <img src={paletteUrl} alt={t("配色参考图", "Palette source")} />}<button className="studio-primary" disabled={!paletteFile || busy} onClick={() => void extractPalette()}>{t("提取配色", "Extract palette")} →</button></section>
          <section className="visual-panel palette-wall">{palette.length ? <><div className="swatch-grid">{palette.map((color, index) => <button key={color + index} style={{ background: color }} onClick={() => void navigator.clipboard.writeText(color)}><span>{["PRIMARY", "ACCENT", "SURFACE", "HIGHLIGHT", "MUTED", "SUPPORT", "DETAIL", "INK"][index]}</span><strong>{color}</strong></button>)}</div><pre>{cssPalette}</pre><div className="visual-actions"><button onClick={() => download("LR-palette.css", `:root {\n${cssPalette.split("\n").map((line) => `  ${line}`).join("\n")}\n}`, "text/css;charset=utf-8")}>CSS ↓</button><button onClick={() => download("LR-palette.json", JSON.stringify(palette, null, 2), "application/json;charset=utf-8")}>JSON ↓</button></div></> : <div className="visual-empty"><ToolIcon category="Colors" /><strong>{t("8 个颜色会铺成一面可以点击复制的色板墙。", "Eight colors will become a clickable palette wall.")}</strong></div>}</section>
        </div>
      )}

      {id === "screenshot" && (
        <div className="visual-split screenshot-layout">
          <section className="visual-panel visual-editor"><div className="visual-panel-head"><strong>LOCAL HTML</strong><span>NO REMOTE ASSETS</span></div><textarea aria-label="HTML card source" value={cardSource} onChange={(event) => setCardSource(event.target.value)} rows={18} spellCheck={false} /><div className="control-grid"><label>{t("卡片宽度", "Card width")}<select value={cardWidth} onChange={(event) => setCardWidth(Number(event.target.value))}><option value="600">600 px</option><option value="900">900 px</option><option value="1200">1200 px</option></select></label><label>{t("画布背景", "Canvas background")}<input type="color" value={cardBackground} onChange={(event) => setCardBackground(event.target.value)} /></label></div><button className="studio-primary" disabled={busy} onClick={() => void captureCard()}>{t("生成 PNG", "Capture PNG")} →</button><p className="visual-tip">{t("脚本、iframe、图片外链和 CSS url() 都会被阻止。", "Scripts, iframes, image links and CSS url() are blocked.")}</p></section>
          <section className="visual-panel card-stage" style={{ background: cardBackground }}><div className="capture-card" ref={cardRef} style={{ width: `${cardWidth}px`, maxWidth: "100%" }} /></section>
        </div>
      )}

      {id === "cron" && (
        <div className="visual-split cron-layout">
          <section className="visual-panel cron-console"><div className="visual-panel-head"><strong>CRON BUILDER</strong><span>{cronZone}</span></div><div className="preset-row">{[["0 9 * * 1-5", t("工作日 09:00", "Weekdays 09:00")],["0 * * * *", t("每小时", "Hourly")],["0 0 * * *", t("每天 00:00", "Daily 00:00")],["0 9 * * 1", t("每周一 09:00", "Monday 09:00")],["0 9 1 * *", t("每月 1 日", "Monthly on day 1")]].map(([expression, label]) => <button key={expression} onClick={() => setCronExpression(expression)}>{label}</button>)}</div><label>{t("Cron 表达式", "Cron expression")}<input aria-label="Cron expression" value={cronExpression} onChange={(event) => setCronExpression(event.target.value)} spellCheck={false} /></label><label>{t("时区", "Time zone")}<select value={cronZone} onChange={(event) => setCronZone(event.target.value)}>{zones.map((zone) => <option key={zone}>{zone}</option>)}</select></label><button className="studio-primary" disabled={busy} onClick={() => void parseCron()}>{t("验证并生成时间轴", "Validate & build timeline")} →</button><div className="cron-anatomy"><span>MIN</span><span>HOUR</span><span>DAY</span><span>MONTH</span><span>WEEKDAY</span></div></section>
          <section className="visual-panel cron-timeline"><div className="visual-panel-head"><strong>NEXT 10 RUNS</strong><span>LOCAL CALENDAR</span></div>{cronRuns.length ? <ol>{cronRuns.map((run, index) => <li key={run + index}><i>{String(index + 1).padStart(2, "0")}</i><span>{run}</span></li>)}</ol> : <div className="visual-empty"><ToolIcon category="Time" /><strong>{t("下一次运行时间会排成时间轴。", "Upcoming executions will line up as a timeline.")}</strong></div>}</section>
        </div>
      )}

      {id === "password" && (
        <div className="visual-split password-layout">
          <section className="visual-panel password-console"><div className="visual-panel-head"><strong>LOCAL STRENGTH CHECK</strong><span>NEVER SAVED</span></div><label>{t("待检查密码", "Password to check")}<div className="password-input"><input aria-label="Password to check" type={showPassword ? "text" : "password"} value={password} onChange={(event) => { setPassword(event.target.value); setPasswordReport(null); }} autoComplete="off" /><button onClick={() => setShowPassword((value) => !value)}>{showPassword ? t("隐藏", "Hide") : t("显示", "Show")}</button></div></label><div className="password-rules"><span className={password.length >= 12 ? "ok" : ""}>12+ {t("字符", "chars")}</span><span className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? "ok" : ""}>Aa</span><span className={/\d/.test(password) ? "ok" : ""}>123</span><span className={/[^\w\s]/.test(password) ? "ok" : ""}>!@#</span></div><button className="studio-primary" disabled={!password || busy} onClick={() => void checkPassword()}>{t("分析弱模式", "Analyze patterns")} →</button><p className="visual-tip">{t("这个工具用于评估你自己输入的密码，不会上传、保存或写入执行历史内容。", "This evaluates a password you enter yourself. It is not uploaded, saved, or stored in history content.")}</p></section>
          <section className="visual-panel password-meter">{passwordReport ? <><div className={`score-orb score-${passwordReport.score}`}><strong>{passwordReport.score}/4</strong><span>{scoreLabels[passwordReport.score]}</span></div><div className="strength-bars">{[0,1,2,3,4].map((value) => <i key={value} className={value <= passwordReport.score ? "active" : ""} />)}</div><div className="password-stats"><article><small>{t("估算猜测数量级", "Estimated guesses")}</small><strong>10^{passwordReport.guessesLog10.toFixed(1)}</strong></article><article><small>{t("快速离线猜测", "Fast offline attack")}</small><strong>{friendlyDuration(10 ** Math.min(20, passwordReport.guessesLog10) / 1e10)}</strong></article></div>{passwordReport.warning && <div className="privacy-alert">{passwordReport.warning}</div>}<div className="pattern-tags">{passwordReport.patterns.map((pattern) => <span key={pattern}>{pattern}</span>)}</div>{passwordReport.suggestions.length > 0 && <ul>{passwordReport.suggestions.map((suggestion) => <li key={suggestion}>{suggestion}</li>)}</ul>}</> : <div className="visual-empty"><ToolIcon category="Crypto" /><strong>{t("强度、模式和估算会显示在仪表盘。", "Strength, patterns and estimates will appear on the meter.")}</strong></div>}</section>
        </div>
      )}

      {id === "time" && (
        <div className="visual-stack time-layout">
          <section className="visual-panel time-controls"><div className="control-grid three"><label>{t("起始 ISO 时间", "Start ISO time")}<input aria-label="Start ISO time" value={timeStart} onChange={(event) => setTimeStart(event.target.value)} /></label><label>{t("比较 ISO 时间", "Compare ISO time")}<input aria-label="Compare ISO time" value={timeEnd} onChange={(event) => setTimeEnd(event.target.value)} /></label><label>{t("目标时区", "Target zone")}<select value={targetZone} onChange={(event) => setTargetZone(event.target.value)}>{zones.map((zone) => <option key={zone}>{zone}</option>)}</select></label></div><div className="visual-actions"><button onClick={() => { const now = new Date(); setTimeStart(now.toISOString()); setTimeEnd(new Date(now.getTime() + 86400000).toISOString()); }}>{t("使用现在", "Use now")}</button><button className="studio-primary" disabled={busy} onClick={() => void calculateTime()}>{t("计算", "Calculate")} →</button></div></section>
          <section className="world-clocks">{worldZones.map((zone) => <article key={zone}><small>{zone}</small><strong>{new Intl.DateTimeFormat(en ? "en-US" : "zh-CN", { timeZone: zone, hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date())}</strong><span>{new Intl.DateTimeFormat(en ? "en-US" : "zh-CN", { timeZone: zone, month: "short", day: "numeric", weekday: "short" }).format(new Date())}</span></article>)}</section>
          {timeReport && <section className="visual-panel time-results"><article><small>ISO 8601</small><strong>{timeReport.iso}</strong></article><article><small>UNIX</small><strong>{timeReport.unix}</strong><span>{timeReport.millis} ms</span></article><article><small>{targetZone}</small><strong>{timeReport.target}</strong></article><article><small>{t("时间差", "Difference")}</small><strong>{timeReport.diffDays.toFixed(3)} {t("天", "days")}</strong><span>{timeReport.diffHours.toFixed(2)} h · {timeReport.diffMinutes.toFixed(0)} min</span></article></section>}
        </div>
      )}

      <footer className="visual-footer"><span><i className="dot" /> {t("输入与文件只在当前设备处理", "Inputs and files stay on this device")}</span><span>{meta.engine}</span></footer>
    </section>
  );
}
