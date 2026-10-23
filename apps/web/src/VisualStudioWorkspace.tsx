import { useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { studios, type VisualStudioId } from "./studios.ts";
import { ToolIcon, UiIcon } from "./Icons.tsx";
import { download, downloadBlob } from "./storage.ts";
import "./visual-studios.css";

type RecordFn = (
  id: string,
  status: "success" | "error",
  elapsedMs: number,
) => void;

type Props = {
  id: VisualStudioId;
  en: boolean;
  onClose: () => void;
  onRecord: RecordFn;
};

const mermaidExample = `flowchart LR
  A[Idea] --> B{Useful?}
  B -->|Yes| C[Build it]
  B -->|No| D[Refine]
  C --> E[Ship with LR Toolbox X]`;

const svgExample = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240">
  <defs><linearGradient id="g"><stop stop-color="#7c91ff"/><stop offset="1" stop-color="#9e70df"/></linearGradient></defs>
  <rect width="600" height="240" rx="40" fill="#111a2b"/>
  <circle cx="110" cy="120" r="58" fill="url(#g)"/>
  <text x="195" y="132" fill="white" font-size="42" font-family="sans-serif">LR Toolbox X</text>
</svg>`;

function bytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function crackTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds >= 60 * 60 * 24 * 365 * 100) return "centuries";
  if (seconds < 1) return "less than a second";
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, "year"],
    [60 * 60 * 24, "day"],
    [60 * 60, "hour"],
    [60, "minute"],
    [1, "second"],
  ];
  for (const [size, name] of units) {
    if (seconds >= size) {
      const value = Math.max(1, Math.round(seconds / size));
      return `${value.toLocaleString()} ${name}${value === 1 ? "" : "s"}`;
    }
  }
  return "less than a second";
}

function blobUrl(blob: Blob | null) {
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

export function VisualStudioWorkspace({ id, en, onClose, onRecord }: Props) {
  const t = (zh: string, english: string) => (en ? english : zh);
  const meta = studios.find((studio) => studio.id === id)!;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const started = useRef(0);

  function begin() {
    started.current = performance.now();
    setBusy(true);
    setError("");
    setStatus(t("正在本地处理…", "Processing locally…"));
  }
  function done() {
    setBusy(false);
    setStatus(t("处理完成", "Done"));
    onRecord(`studio.${id}`, "success", Math.round(performance.now() - started.current));
  }
  function fail(reason: unknown) {
    setBusy(false);
    const message = reason instanceof Error ? reason.message : String(reason);
    setError(message);
    setStatus("");
    onRecord(`studio.${id}`, "error", Math.round(performance.now() - started.current));
  }

  return (
    <section className={`visual-studio visual-${id}`} aria-label={en ? meta.en : meta.name}>
      <header className="visual-studio-head">
        <button className="studio-back" onClick={onClose} aria-label="Close studio">
          <UiIcon name="arrow" />
        </button>
        <ToolIcon category={meta.category} />
        <div>
          <span>{meta.engine} · LOCAL FIRST</span>
          <h1>{en ? meta.en : meta.name}</h1>
          <p>{en ? meta.introEn : meta.intro}</p>
        </div>
        <a href={meta.repo} target="_blank" rel="noreferrer">
          GitHub <UiIcon name="external" />
        </a>
      </header>
      {id === "mermaid" && <MermaidStudio en={en} busy={busy} begin={begin} done={done} fail={fail} />}
      {id === "sheet" && <SheetStudio en={en} busy={busy} begin={begin} done={done} fail={fail} />}
      {id === "svg" && <SvgStudio en={en} busy={busy} begin={begin} done={done} fail={fail} />}
      {id === "exif" && <ExifStudio en={en} busy={busy} begin={begin} done={done} fail={fail} />}
      {id === "heic" && <HeicStudio en={en} busy={busy} begin={begin} done={done} fail={fail} />}
      {id === "palette" && <PaletteStudio en={en} busy={busy} begin={begin} done={done} fail={fail} />}
      {id === "cron" && <CronStudio en={en} busy={busy} begin={begin} done={done} fail={fail} />}
      {id === "password" && <PasswordStudio en={en} busy={busy} begin={begin} done={done} fail={fail} />}
      {id === "snapshot" && <SnapshotStudio en={en} busy={busy} begin={begin} done={done} fail={fail} />}
      {id === "datetime" && <DateTimeStudio en={en} busy={busy} begin={begin} done={done} fail={fail} />}
      {(status || error) && (
        <div className={error ? "visual-status error" : "visual-status"} role="status">
          {error || status}
        </div>
      )}
    </section>
  );
}

type ToolProps = {
  en: boolean;
  busy: boolean;
  begin: () => void;
  done: () => void;
  fail: (e: unknown) => void;
};

function MermaidStudio({ en, busy, begin, done, fail }: ToolProps) {
  const t = (zh: string, english: string) => (en ? english : zh);
  const [source, setSource] = useState(mermaidExample);
  const [svg, setSvg] = useState("");
  const [theme, setTheme] = useState("dark");
  async function render() {
    begin();
    try {
      const { default: mermaid } = await import("mermaid");
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: theme as "dark" | "default" | "forest" | "neutral",
      });
      await mermaid.parse(source);
      const { svg } = await mermaid.render(`lrx-mermaid-${Date.now()}`, source);
      setSvg(svg);
      done();
    } catch (e) {
      fail(e);
    }
  }
  useEffect(() => {
    void render();
    // Initial render only; explicit button keeps large diagram rendering predictable.
  }, []);
  return (
    <div className="visual-grid diagram-grid">
      <article className="visual-panel code-panel">
        <div className="visual-panel-head">
          <strong>{t("图表源码", "Diagram source")}</strong>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} aria-label="Mermaid theme">
            <option value="dark">Dark</option><option value="default">Default</option><option value="forest">Forest</option><option value="neutral">Neutral</option>
          </select>
        </div>
        <textarea value={source} onChange={(e) => setSource(e.target.value)} aria-label="Mermaid source" spellCheck={false} />
        <div className="visual-actions">
          <button className="primary" disabled={busy} onClick={render}>{t("重新渲染", "Render")}</button>
          <button onClick={() => setSource(mermaidExample)}>{t("载入示例", "Example")}</button>
        </div>
      </article>
      <article className="visual-panel canvas-panel">
        <div className="visual-panel-head"><strong>{t("实时画布", "Canvas")}</strong><span>SVG</span></div>
        <div className="mermaid-canvas" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } }) }} />
        <div className="visual-actions">
          <button disabled={!svg} onClick={() => download("diagram.svg", svg, "image/svg+xml")}>{t("下载 SVG", "Download SVG")}</button>
        </div>
      </article>
    </div>
  );
}

function SheetStudio({ en, busy, begin, done, fail }: ToolProps) {
  const t = (zh: string, english: string) => (en ? english : zh);
  const [name, setName] = useState("");
  const [book, setBook] = useState<unknown>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [active, setActive] = useState("");
  const [rows, setRows] = useState<unknown[][]>([]);
  async function open(file: File) {
    begin();
    try {
      if (file.size > 20_000_000) throw Error(t("表格最大 20 MB", "Spreadsheet limit is 20 MB"));
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      setName(file.name);
      setBook(wb);
      setSheets(wb.SheetNames);
      const first = wb.SheetNames[0] ?? "";
      setActive(first);
      setRows(first ? (XLSX.utils.sheet_to_json(wb.Sheets[first], { header: 1, defval: "" }) as unknown[][]).slice(0, 200) : []);
      done();
    } catch (e) { fail(e); }
  }
  async function selectSheet(sheet: string) {
    setActive(sheet);
    const XLSX = await import("xlsx");
    const wb = book as { Sheets: Record<string, unknown> };
    setRows((XLSX.utils.sheet_to_json(wb.Sheets[sheet] as never, { header: 1, defval: "" }) as unknown[][]).slice(0, 200));
  }
  async function exportAs(kind: "csv" | "json" | "xlsx") {
    if (!book || !active) return;
    const XLSX = await import("xlsx");
    const wb = book as { Sheets: Record<string, never>; SheetNames: string[] };
    if (kind === "csv") download(`${active}.csv`, XLSX.utils.sheet_to_csv(wb.Sheets[active]), "text/csv;charset=utf-8");
    if (kind === "json") download(`${active}.json`, JSON.stringify(XLSX.utils.sheet_to_json(wb.Sheets[active], { defval: null }), null, 2), "application/json");
    if (kind === "xlsx") {
      const data = XLSX.write(wb as never, { type: "array", bookType: "xlsx" });
      downloadBlob(name.replace(/\.[^.]+$/, "") + "-copy.xlsx", new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    }
  }
  return (
    <div className="sheet-layout">
      <aside className="sheet-sidebar visual-panel">
        <label className="drop-card"><input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => e.target.files?.[0] && void open(e.target.files[0])} /><UiIcon name="upload"/><strong>{t("打开 XLSX / XLS / CSV", "Open XLSX / XLS / CSV")}</strong><small>{t("仅在本机解析 · 最大 20 MB", "Parsed locally · 20 MB max")}</small></label>
        {name && <div className="file-chip"><b>{name}</b><small>{sheets.length} Sheets</small></div>}
        <nav>{sheets.map((sheet) => <button className={sheet === active ? "selected" : ""} key={sheet} onClick={() => void selectSheet(sheet)}>{sheet}</button>)}</nav>
      </aside>
      <article className="visual-panel sheet-table-panel">
        <div className="visual-panel-head"><strong>{active || t("表格预览", "Spreadsheet preview")}</strong><span>{rows.length ? `${Math.max(0, rows.length - 1)} rows previewed` : ""}</span></div>
        <div className="sheet-scroll"><table><tbody>{rows.map((row, r) => <tr key={r}>{row.map((cell, c) => r === 0 ? <th key={c}>{String(cell)}</th> : <td key={c}>{String(cell)}</td>)}</tr>)}</tbody></table></div>
        <div className="visual-actions"><button disabled={!book || busy} onClick={() => void exportAs("csv")}>CSV</button><button disabled={!book || busy} onClick={() => void exportAs("json")}>JSON</button><button disabled={!book || busy} onClick={() => void exportAs("xlsx")}>XLSX</button></div>
      </article>
    </div>
  );
}

function SvgStudio({ en, busy, begin, done, fail }: ToolProps) {
  const t = (zh: string, english: string) => (en ? english : zh);
  const [source, setSource] = useState(svgExample);
  const [optimized, setOptimized] = useState("");
  async function optimizeSvg() {
    begin();
    try {
      if (new Blob([source]).size > 2_000_000) throw Error(t("SVG 最大 2 MB", "SVG limit is 2 MB"));
      const { optimize } = await import("svgo/browser");
      const result = optimize(source, { multipass: true });
      setOptimized(result.data);
      done();
    } catch (e) { fail(e); }
  }
  useEffect(() => { void optimizeSvg(); }, []);
  const before = new Blob([source]).size, after = optimized ? new Blob([optimized]).size : before;
  const safe = DOMPurify.sanitize(optimized || source, { USE_PROFILES: { svg: true, svgFilters: true } });
  return (
    <div className="svg-layout visual-grid">
      <article className="visual-panel code-panel"><div className="visual-panel-head"><strong>SVG SOURCE</strong><span>{bytes(before)}</span></div><textarea value={source} onChange={(e) => setSource(e.target.value)} aria-label="SVG source" spellCheck={false}/><div className="visual-actions"><button className="primary" disabled={busy} onClick={optimizeSvg}>{t("运行 SVGO", "Optimize")}</button></div></article>
      <article className="visual-panel canvas-panel"><div className="visual-panel-head"><strong>{t("优化预览", "Optimized preview")}</strong><span className="saving">-{before ? Math.max(0, Math.round((1 - after / before) * 100)) : 0}% · {bytes(after)}</span></div><div className="svg-preview" dangerouslySetInnerHTML={{ __html: safe }}/><pre className="svg-output">{optimized}</pre><div className="visual-actions"><button disabled={!optimized} onClick={() => download("optimized.svg", optimized, "image/svg+xml")}>{t("下载优化 SVG", "Download optimized SVG")}</button></div></article>
    </div>
  );
}

function ExifStudio({ en, busy, begin, done, fail }: ToolProps) {
  const t = (zh: string, english: string) => (en ? english : zh);
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<Record<string, { description?: string; value?: unknown }> | null>(null);
  const url = blobUrl(file);
  async function inspect(next: File) {
    begin();
    try {
      if (next.size > 20_000_000) throw Error(t("图片最大 20 MB", "Image limit is 20 MB"));
      const ExifReader = await import("exifreader");
      const data = ExifReader.load(await next.arrayBuffer(), { expanded: false }) as Record<string, { description?: string; value?: unknown }>;
      setFile(next); setTags(data); done();
    } catch (e) { fail(e); }
  }
  const pick = (names: string[]) => names.map((name) => [name, tags?.[name]?.description]).find(([, value]) => value);
  const highlights = [pick(["Make"]), pick(["Model"]), pick(["LensModel", "Lens"]), pick(["FNumber"]), pick(["ExposureTime"]), pick(["ISOSpeedRatings", "PhotographicSensitivity"]), pick(["FocalLength"]), pick(["DateTimeOriginal", "DateTime"])] .filter(Boolean) as [string, string][];
  const gps = Boolean(tags && (tags.GPSLatitude || tags.GPSLongitude));
  return (
    <div className="photo-layout">
      <article className="visual-panel photo-preview"><label className="drop-card"><input type="file" accept="image/*,.heic,.heif" disabled={busy} onChange={(e) => e.target.files?.[0] && void inspect(e.target.files[0])}/><UiIcon name="upload"/><strong>{t("放入一张照片", "Drop in a photo")}</strong><small>JPEG · PNG · WebP · HEIC · AVIF</small></label>{url && <img src={url} alt="Metadata source"/>}</article>
      <article className="visual-panel metadata-panel"><div className="visual-panel-head"><strong>{t("摄影信息卡", "Photo metadata")}</strong>{gps && <span className="privacy-warning">GPS</span>}</div>{gps && <p className="privacy-banner">{t("这张照片包含 GPS 位置信息。分享原图前请留意隐私。", "This photo contains GPS metadata. Consider privacy before sharing the original.")}</p>}<div className="metadata-grid">{highlights.map(([key, value]) => <div key={key}><small>{key}</small><strong>{value}</strong></div>)}</div>{tags && <details><summary>{t(`查看全部 ${Object.keys(tags).length} 个字段`, `View all ${Object.keys(tags).length} tags`)}</summary><pre>{JSON.stringify(Object.fromEntries(Object.entries(tags).map(([k, v]) => [k, v.description ?? v.value])), null, 2)}</pre></details>}</article>
    </div>
  );
}

function HeicStudio({ en, busy, begin, done, fail }: ToolProps) {
  const t = (zh: string, english: string) => (en ? english : zh);
  const [input, setInput] = useState<File | null>(null);
  const [output, setOutput] = useState<Blob | null>(null);
  const [format, setFormat] = useState<"image/jpeg" | "image/png">("image/jpeg");
  const [quality, setQuality] = useState(0.9);
  const url = blobUrl(output);
  async function convert(file = input) {
    if (!file) return;
    begin();
    try {
      if (file.size > 20_000_000) throw Error(t("HEIC 最大 20 MB", "HEIC limit is 20 MB"));
      const { default: heic2any } = await import("heic2any");
      const result = await heic2any({ blob: file, toType: format, quality });
      const blob = Array.isArray(result) ? result[0] : result;
      setOutput(blob); done();
    } catch (e) { fail(e); }
  }
  return (
    <div className="converter-layout visual-grid"><article className="visual-panel"><label className="drop-card tall"><input type="file" accept=".heic,.heif,image/heic,image/heif" onChange={(e) => { const f=e.target.files?.[0]; if(f){setInput(f); setOutput(null);} }}/><UiIcon name="upload"/><strong>{input?.name || t("选择 HEIC / HEIF", "Choose HEIC / HEIF")}</strong><small>{input ? bytes(input.size) : t("转换完全在浏览器完成", "Conversion stays in your browser")}</small></label><div className="control-row"><select value={format} onChange={(e) => setFormat(e.target.value as typeof format)}><option value="image/jpeg">JPG</option><option value="image/png">PNG</option></select><label>{t("质量", "Quality")} {Math.round(quality*100)}%<input type="range" min="0.4" max="1" step="0.05" value={quality} onChange={(e)=>setQuality(Number(e.target.value))}/></label></div><button className="primary wide" disabled={!input || busy} onClick={() => void convert()}>{t("开始转换", "Convert")}</button></article><article className="visual-panel canvas-panel"><div className="visual-panel-head"><strong>{t("转换结果", "Converted image")}</strong>{output && <span>{bytes(output.size)}</span>}</div>{url ? <img className="converted-preview" src={url} alt="Converted HEIC"/> : <div className="empty-canvas">HEIC → JPG / PNG</div>}<div className="visual-actions"><button disabled={!output} onClick={()=>output && downloadBlob(`converted.${format === "image/png" ? "png" : "jpg"}`, output)}>{t("下载结果", "Download")}</button></div></article></div>
  );
}

function PaletteStudio({ en, busy, begin, done, fail }: ToolProps) {
  const t = (zh: string, english: string) => (en ? english : zh);
  const [file, setFile] = useState<File | null>(null);
  const [colors, setColors] = useState<{ hex: string; rgb: string; text: string }[]>([]);
  const url = blobUrl(file);
  async function extract(next: File) {
    begin();
    try {
      if (next.size > 15_000_000) throw Error(t("图片最大 15 MB", "Image limit is 15 MB"));
      const image = document.createElement("img");
      const temp = URL.createObjectURL(next);
      try {
        image.src = temp;
        await image.decode();
        const mod = await import("colorthief");
        const palette = mod.getPaletteSync(image, { colorCount: 8 });
        if (!palette) throw Error(t("无法从图片提取配色", "Could not extract a palette from this image"));
        setColors(palette.map((color) => ({ hex: color.hex(), rgb: color.css(), text: color.textColor })));
        setFile(next); done();
      } finally { URL.revokeObjectURL(temp); }
    } catch (e) { fail(e); }
  }
  const css = `:root {\n${colors.map((color, i) => `  --image-color-${i+1}: ${color.hex};`).join("\n")}\n}`;
  return (
    <div className="palette-layout"><article className="visual-panel palette-photo"><label className="drop-card"><input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={(e)=>e.target.files?.[0]&&void extract(e.target.files[0])}/><UiIcon name="upload"/><strong>{t("从图片提取配色", "Extract a palette")}</strong><small>PNG · JPEG · WebP</small></label>{url && <img src={url} alt="Palette source"/>}</article><article className="visual-panel"><div className="visual-panel-head"><strong>{t("视觉色板", "Visual palette")}</strong><span>{colors.length ? `${colors.length} colors` : ""}</span></div><div className="swatch-grid">{colors.map((color) => <button key={color.hex} style={{background:color.hex,color:color.text}} onClick={()=>void navigator.clipboard.writeText(color.hex)}><b>{color.hex}</b><small>{color.rgb}</small></button>)}</div><pre className="css-vars">{colors.length ? css : t("选择图片后生成 CSS Variables", "Choose an image to generate CSS variables")}</pre><div className="visual-actions"><button disabled={!colors.length} onClick={()=>download("palette.css",css,"text/css")}>CSS</button><button disabled={!colors.length} onClick={()=>download("palette.json",JSON.stringify(colors,null,2),"application/json")}>JSON</button></div></article></div>
  );
}

function CronStudio({ en, busy, begin, done, fail }: ToolProps) {
  const t = (zh: string, english: string) => (en ? english : zh);
  const [preset, setPreset] = useState("daily");
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [expression, setExpression] = useState("0 9 * * *");
  const [zone, setZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [next, setNext] = useState<Date[]>([]);
  const generated = useMemo(() => {
    if (preset === "hourly") return `${minute} * * * *`;
    if (preset === "weekday") return `${minute} ${hour} * * 1-5`;
    if (preset === "weekly") return `${minute} ${hour} * * 1`;
    if (preset === "monthly") return `${minute} ${hour} 1 * *`;
    return `${minute} ${hour} * * *`;
  }, [preset, hour, minute]);
  useEffect(() => { setExpression(generated); }, [generated]);
  async function calculate() {
    begin();
    try {
      const { CronExpressionParser } = await import("cron-parser");
      const interval = CronExpressionParser.parse(expression, { currentDate: new Date(), tz: zone });
      setNext(Array.from({ length: 10 }, () => interval.next().toDate()));
      done();
    } catch (e) { fail(e); }
  }
  return (
    <div className="cron-layout"><article className="visual-panel cron-builder"><div className="visual-panel-head"><strong>{t("时间编排", "Schedule builder")}</strong><span>{zone}</span></div><div className="preset-grid">{[["hourly","每小时","Hourly"],["daily","每天","Daily"],["weekday","工作日","Weekdays"],["weekly","每周一","Mondays"],["monthly","每月 1 日","Monthly"]].map(([value,zh,english])=><button key={value} className={preset===value?"selected":""} onClick={()=>setPreset(value)}>{en?english:zh}</button>)}</div><div className="time-dials"><label>{t("小时", "Hour")}<input type="number" min="0" max="23" value={hour} onChange={(e)=>setHour(Math.max(0,Math.min(23,Number(e.target.value))))}/></label><label>{t("分钟", "Minute")}<input type="number" min="0" max="59" value={minute} onChange={(e)=>setMinute(Math.max(0,Math.min(59,Number(e.target.value))))}/></label></div><label>{t("Cron 表达式", "Cron expression")}<input className="cron-expression" value={expression} onChange={(e)=>setExpression(e.target.value)}/></label><label>{t("时区", "Timezone")}<input value={zone} onChange={(e)=>setZone(e.target.value)} /></label><button className="primary wide" disabled={busy} onClick={()=>void calculate()}>{t("计算未来执行时间", "Calculate next runs")}</button></article><article className="visual-panel timeline-panel"><div className="visual-panel-head"><strong>{t("下 10 次执行", "Next 10 runs")}</strong><span>{expression}</span></div><ol className="cron-timeline">{next.map((date,i)=><li key={date.toISOString()}><b>{String(i+1).padStart(2,"0")}</b><span>{date.toLocaleString(en?"en-US":"zh-CN",{timeZone:zone})}</span><small>{date.toISOString()}</small></li>)}</ol></article></div>
  );
}

function PasswordStudio({ en, busy, begin, done, fail }: ToolProps) {
  const t = (zh: string, english: string) => (en ? english : zh);
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<{ score: number; crack: string; warning: string; suggestions: string[]; guesses: number } | null>(null);
  async function inspect(value = password) {
    if (!value) { setResult(null); return; }
    begin();
    try {
      const [{ ZxcvbnFactory }, common, language] = await Promise.all([import("@zxcvbn-ts/core"), import("@zxcvbn-ts/language-common"), import("@zxcvbn-ts/language-en")]);
      const engine = new ZxcvbnFactory({ dictionary: { ...common.dictionary, ...language.dictionary }, graphs: common.adjacencyGraphs, translations: language.translations, useLevenshteinDistance: true });
      const data = engine.check(value);
      setResult({ score: data.score, crack: crackTime(data.guesses / 10_000), warning: data.feedback.warning || "", suggestions: data.feedback.suggestions, guesses: data.guesses });
      done();
    } catch (e) { fail(e); }
  }
  return (
    <div className="password-layout"><article className="visual-panel password-console"><div className="visual-panel-head"><strong>{t("本地密码实验室", "Local password lab")}</strong><span>NO NETWORK</span></div><label>{t("待分析密码", "Password to analyze")}<input type="password" autoComplete="new-password" value={password} onChange={(e)=>setPassword(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&void inspect()} placeholder={t("密码只停留在当前浏览器内存中", "Password stays in browser memory")}/></label><button className="primary wide" disabled={!password || busy} onClick={()=>void inspect()}>{t("分析强度", "Analyze strength")}</button><p className="privacy-banner">{t("不会检查线上泄露库，也不会发送密码；这里只做本地模式与破解成本估算。", "No breach lookup and no upload. This only estimates local pattern strength and cracking cost.")}</p></article><article className="visual-panel score-panel">{result ? <><div className={`score-orb score-${result.score}`}><b>{result.score}</b><span>/ 4</span></div><div className="strength-bars">{[0,1,2,3,4].map(i=><i key={i} className={i<=result.score?"active":""}/>)}</div><h2>{[t("非常弱","Very weak"),t("较弱","Weak"),t("一般","Fair"),t("较强","Strong"),t("很强","Very strong")][result.score]}</h2><dl><div><dt>{t("估算破解时间", "Estimated crack time")}</dt><dd>{result.crack}</dd></div><div><dt>{t("猜测规模", "Estimated guesses")}</dt><dd>{result.guesses.toLocaleString()}</dd></div></dl>{result.warning&&<p className="warning-copy">{result.warning}</p>}<ul>{result.suggestions.map((item)=><li key={item}>{item}</li>)}</ul></> : <div className="empty-canvas">••••••••<small>{t("输入密码开始本地分析", "Enter a password to analyze locally")}</small></div>}</article></div>
  );
}

function SnapshotStudio({ en, busy, begin, done, fail }: ToolProps) {
  const t = (zh: string, english: string) => (en ? english : zh);
  const [html, setHtml] = useState(`<div class="card"><small>LR TOOLBOX X</small><h1>Make useful things.</h1><p>Local-first tools with a little personality.</p><b>2026 →</b></div>`);
  const [css, setCss] = useState(`.card{width:720px;min-height:360px;padding:64px;border-radius:40px;color:#f7f8ff;background:linear-gradient(135deg,#182642,#6d68cb);font-family:system-ui}.card small{letter-spacing:.2em;opacity:.7}.card h1{font-size:54px;margin:80px 0 12px}.card p{font-size:21px;opacity:.8}.card b{display:block;margin-top:48px}`);
  const [png, setPng] = useState<Blob | null>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const pngUrl = blobUrl(png);
  const safeHtml = DOMPurify.sanitize(html, { FORBID_TAGS: ["script", "iframe", "object", "embed", "form"] });
  const safeCss = css.replace(/@import/gi, "/* blocked */").replace(/url\s*\([^)]*\)/gi, "none").replace(/expression\s*\([^)]*\)/gi, "none");
  async function capture() {
    begin();
    try {
      if (!canvasHost.current) throw Error("Preview unavailable");
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(canvasHost.current, { backgroundColor: null, scale: 2, logging: false, useCORS: false, allowTaint: false });
      const blob = await new Promise<Blob>((resolve, reject)=>canvas.toBlob((value)=>value?resolve(value):reject(Error("PNG export failed")),"image/png"));
      setPng(blob); done();
    } catch (e) { fail(e); }
  }
  return (
    <div className="snapshot-layout"><article className="visual-panel snapshot-editor"><div className="editor-tabs"><strong>HTML</strong><span>+</span><strong>CSS</strong></div><label>HTML<textarea value={html} onChange={(e)=>setHtml(e.target.value)} spellCheck={false}/></label><label>CSS<textarea value={css} onChange={(e)=>setCss(e.target.value)} spellCheck={false}/></label><button className="primary wide" disabled={busy} onClick={()=>void capture()}>{t("渲染并导出 PNG", "Render & export PNG")}</button></article><article className="visual-panel snapshot-canvas"><div className="visual-panel-head"><strong>{t("安全预览画布", "Safe preview canvas")}</strong><span>2× PNG</span></div><div className="snapshot-stage"><style>{safeCss}</style><div ref={canvasHost} dangerouslySetInnerHTML={{__html:safeHtml}}/></div>{pngUrl&&<div className="snapshot-result"><img src={pngUrl} alt="HTML snapshot result"/><button onClick={()=>png&&downloadBlob("card.png",png)}>{t("下载 PNG", "Download PNG")}</button></div>}</article></div>
  );
}

function DateTimeStudio({ en, busy, begin, done, fail }: ToolProps) {
  const t = (zh: string, english: string) => (en ? english : zh);
  const [input, setInput] = useState(new Date().toISOString().slice(0,16));
  const [fromZone, setFromZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [toZone, setToZone] = useState("Asia/Shanghai");
  const [result, setResult] = useState<{ iso:string; unix:number; milliseconds:number; from:string; to:string; relative:string; dayDiff:number } | null>(null);
  async function convert() {
    begin();
    try {
      const [{ default: dayjs }, { default: utc }, { default: timezone }, { default: relativeTime }] = await Promise.all([import("dayjs"), import("dayjs/plugin/utc"), import("dayjs/plugin/timezone"), import("dayjs/plugin/relativeTime")]);
      dayjs.extend(utc); dayjs.extend(timezone); dayjs.extend(relativeTime);
      const date = dayjs.tz(input, fromZone);
      if (!date.isValid()) throw Error(t("无法解析这个时间", "Could not parse this time"));
      const target = date.tz(toZone);
      setResult({ iso: date.toISOString(), unix: date.unix(), milliseconds: date.valueOf(), from: date.format("YYYY-MM-DD HH:mm:ss Z"), to: target.format("YYYY-MM-DD HH:mm:ss Z"), relative: date.fromNow(), dayDiff: dayjs().diff(date,"day") });
      done();
    } catch (e) { fail(e); }
  }
  return (
    <div className="datetime-layout"><article className="visual-panel time-control"><div className="visual-panel-head"><strong>{t("时间输入", "Time input")}</strong><span>Day.js</span></div><label>{t("日期与时间", "Date & time")}<input type="datetime-local" value={input} onChange={(e)=>setInput(e.target.value)}/></label><label>{t("来源时区", "From timezone")}<input value={fromZone} onChange={(e)=>setFromZone(e.target.value)}/></label><div className="timezone-arrow">↓</div><label>{t("目标时区", "To timezone")}<input value={toZone} onChange={(e)=>setToZone(e.target.value)}/></label><button className="primary wide" disabled={busy} onClick={()=>void convert()}>{t("建立时间线", "Build timeline")}</button></article><article className="visual-panel time-results"><div className="visual-panel-head"><strong>{t("时间线", "Timeline")}</strong><span>{result?.relative||""}</span></div>{result ? <div className="time-cards"><div><small>{fromZone}</small><strong>{result.from}</strong></div><div className="timeline-line"><i/><span>{t("同一时刻", "Same instant")}</span><i/></div><div><small>{toZone}</small><strong>{result.to}</strong></div><dl><div><dt>ISO 8601</dt><dd>{result.iso}</dd></div><div><dt>Unix</dt><dd>{result.unix}</dd></div><div><dt>Milliseconds</dt><dd>{result.milliseconds}</dd></div><div><dt>{t("距今天整日差", "Whole-day difference")}</dt><dd>{result.dayDiff}</dd></div></dl></div> : <div className="empty-canvas">TIME<small>{t("选择时间和两个时区", "Choose a time and two zones")}</small></div>}</article></div>
  );
}
