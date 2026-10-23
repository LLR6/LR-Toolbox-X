import { useEffect, useMemo, useRef, useState } from "react";
import { studios, type PowerStudioId } from "./studios.ts";
import { ToolIcon } from "./Icons.tsx";
import { download, downloadBlob } from "./storage.ts";
import "./visual-studios.css";
import "./power-studios.css";

type Status = "success" | "error";

type Props = {
  id: PowerStudioId;
  en: boolean;
  onClose: () => void;
  onRecord: (id: string, status: Status, ms: number) => void;
};

const JSON_EXAMPLE = `{
  "name": "LR Toolbox X",
  "version": 11,
  "localFirst": true,
  "features": ["quicktype", "charts", "math", "latex", "lottie", "barcode"]
}`;

const CHART_EXAMPLE = `month,value
Jan,42
Feb,58
Mar,51
Apr,76
May,69
Jun,91`;

const LATEX_EXAMPLE = String.raw`\int_0^1 x^2\,dx = \frac{1}{3}`;

const LOTTIE_EXAMPLE = JSON.stringify({
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 120,
  w: 512,
  h: 320,
  nm: "LR Pulse",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Pulse",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [256, 160, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [70, 70, 100], e: [120, 120, 100] },
            { t: 60, s: [120, 120, 100], e: [70, 70, 100] },
            { t: 120, s: [70, 70, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        { ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [170, 170] }, nm: "Ellipse" },
        { ty: "fl", c: { a: 0, k: [0.33, 0.42, 0.78, 1] }, o: { a: 0, k: 100 }, r: 1, nm: "Fill" },
      ],
      ip: 0,
      op: 120,
      st: 0,
      bm: 0,
    },
  ],
});

function dataUrlBlob(dataUrl: string) {
  const [header, payload] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(header)?.[1] || "application/octet-stream";
  const bytes = Uint8Array.from(atob(payload), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}

function parseChartRows(source: string) {
  const trimmed = source.trim();
  if (!trimmed) return [] as { label: string; value: number }[];
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const raw = JSON.parse(trimmed) as unknown;
    const array = Array.isArray(raw) ? raw : [raw];
    return array.map((item, index) => {
      if (typeof item === "number") return { label: String(index + 1), value: item };
      if (!item || typeof item !== "object") throw Error("JSON rows must be objects or numbers");
      const record = item as Record<string, unknown>;
      const keys = Object.keys(record);
      const numericKey = keys.find((key) => Number.isFinite(Number(record[key])));
      if (!numericKey) throw Error("Each JSON row needs a numeric value");
      const labelKey = keys.find((key) => key !== numericKey);
      return { label: String(labelKey ? record[labelKey] : index + 1), value: Number(record[numericKey]) };
    });
  }
  const lines = trimmed.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw Error("CSV needs a header and at least one row");
  return lines.slice(1).map((line, index) => {
    const cells = line.split(",").map((cell) => cell.trim());
    const value = Number(cells[1]);
    if (!Number.isFinite(value)) throw Error(`Row ${index + 2} has an invalid value`);
    return { label: cells[0] || String(index + 1), value };
  });
}

export function PowerStudioWorkspace({ id, en, onClose, onRecord }: Props) {
  const meta = studios.find((studio) => studio.id === id)!;
  const t = (zh: string, english: string) => (en ? english : zh);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [jsonSource, setJsonSource] = useState(JSON_EXAMPLE);
  const [targetLanguage, setTargetLanguage] = useState("typescript");
  const [generatedCode, setGeneratedCode] = useState("");

  const [chartSource, setChartSource] = useState(CHART_EXAMPLE);
  const [chartType, setChartType] = useState("bar");
  const chartHost = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<{ dispose: () => void; getDataURL: (options?: Record<string, unknown>) => string } | null>(null);

  const [expression, setExpression] = useState("det([1, 2; 3, 4])");
  const [mathResult, setMathResult] = useState("");
  const [matrixSource, setMatrixSource] = useState("[[1,2],[3,4]]");
  const [matrixResult, setMatrixResult] = useState("");

  const [latexSource, setLatexSource] = useState(LATEX_EXAMPLE);
  const [displayMode, setDisplayMode] = useState(true);
  const formulaHost = useRef<HTMLDivElement>(null);

  const [lottieSource, setLottieSource] = useState(LOTTIE_EXAMPLE);
  const [lottieSpeed, setLottieSpeed] = useState(1);
  const [lottieInfo, setLottieInfo] = useState({ frames: 0, seconds: 0, layers: 0 });
  const lottieHost = useRef<HTMLDivElement>(null);
  const lottieAnimation = useRef<{ destroy: () => void; play: () => void; pause: () => void; setSpeed: (speed: number) => void } | null>(null);

  const [barcodeText, setBarcodeText] = useState("LR-TOOLBOX-X-2026");
  const [barcodeType, setBarcodeType] = useState("code128");
  const [scanResult, setScanResult] = useState("");
  const barcodeCanvas = useRef<HTMLCanvasElement>(null);

  const languageOptions = useMemo(
    () => [
      ["typescript", "TypeScript"],
      ["python", "Python"],
      ["go", "Go"],
      ["java", "Java"],
      ["kotlin", "Kotlin"],
      ["rust", "Rust"],
      ["csharp", "C#"],
      ["swift", "Swift"],
    ],
    [],
  );

  useEffect(() => () => chartInstance.current?.dispose(), []);
  useEffect(() => () => lottieAnimation.current?.destroy(), []);

  async function perform(task: () => Promise<void>) {
    const started = performance.now();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await task();
      onRecord(`studio.${id}`, "success", Math.round(performance.now() - started));
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(message);
      onRecord(`studio.${id}`, "error", Math.round(performance.now() - started));
    } finally {
      setBusy(false);
    }
  }

  async function generateTypes() {
    await perform(async () => {
      JSON.parse(jsonSource);
      const { quicktype, InputData, jsonInputForTargetLanguage, isLanguageName } = await import("quicktype-core");
      if (!isLanguageName(targetLanguage)) throw Error(t("不支持这个目标语言。", "Unsupported target language."));
      const jsonInput = jsonInputForTargetLanguage(targetLanguage);
      await jsonInput.addSource({ name: "LRModel", samples: [jsonSource] });
      const inputData = new InputData();
      inputData.addInput(jsonInput);
      const result = await quicktype({ inputData, lang: targetLanguage, rendererOptions: { "just-types": "true" } });
      setGeneratedCode(result.lines.join("\n"));
      setNotice(t("数据模型已生成。", "Data model generated."));
    });
  }

  async function renderChart() {
    await perform(async () => {
      const rows = parseChartRows(chartSource);
      if (!rows.length || !chartHost.current) throw Error(t("没有可绘制的数据。", "No chartable data."));
      const echarts = await import("echarts");
      chartInstance.current?.dispose();
      const chart = echarts.init(chartHost.current, undefined, { renderer: "canvas" });
      chartInstance.current = chart;
      const labels = rows.map((row) => row.label);
      const values = rows.map((row) => row.value);
      const option = chartType === "pie"
        ? { tooltip: { trigger: "item" }, series: [{ type: "pie", radius: ["35%", "72%"], data: rows.map((row) => ({ name: row.label, value: row.value })) }] }
        : { tooltip: { trigger: "axis" }, grid: { left: 48, right: 22, top: 30, bottom: 44 }, xAxis: { type: "category", data: labels }, yAxis: { type: "value" }, series: [{ type: chartType, smooth: chartType === "line", data: values }] };
      chart.setOption(option);
      setNotice(t("图表已渲染。", "Chart rendered."));
    });
  }

  async function exportChart() {
    const chart = chartInstance.current;
    if (!chart) return;
    const url = chart.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: "#ffffff" });
    downloadBlob("LR-chart.png", dataUrlBlob(url));
  }

  async function calculate() {
    await perform(async () => {
      const math = await import("mathjs");
      const value = math.evaluate(expression);
      setMathResult(math.format(value, { precision: 14 }));
      setNotice(t("计算完成。", "Calculation complete."));
    });
  }

  async function matrixAction(action: "det" | "inv" | "transpose") {
    await perform(async () => {
      const math = await import("mathjs");
      const matrix = JSON.parse(matrixSource) as number[][];
      const value = action === "det" ? math.det(matrix) : action === "inv" ? math.inv(matrix) : math.transpose(matrix);
      setMatrixResult(math.format(value, { precision: 12 }));
      setNotice(t("矩阵运算完成。", "Matrix operation complete."));
    });
  }

  async function renderFormula() {
    await perform(async () => {
      const host = formulaHost.current;
      if (!host) return;
      const katex = await import("katex");
      katex.render(latexSource, host, { displayMode, throwOnError: false, strict: "warn", trust: false, output: "htmlAndMathml" });
      setNotice(t("公式已排版。", "Formula typeset."));
    });
  }

  async function exportFormula() {
    const host = formulaHost.current;
    if (!host) return;
    await perform(async () => {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(host, { backgroundColor: "#ffffff", scale: 2 });
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(Error("PNG export failed")), "image/png"));
      downloadBlob("LR-formula.png", blob);
      setNotice(t("公式 PNG 已生成。", "Formula PNG exported."));
    });
  }

  async function renderLottie() {
    await perform(async () => {
      const data = JSON.parse(lottieSource) as { fr?: number; ip?: number; op?: number; layers?: unknown[] };
      const host = lottieHost.current;
      if (!host) return;
      const module = await import("lottie-web");
      lottieAnimation.current?.destroy();
      host.replaceChildren();
      const animation = module.default.loadAnimation({ container: host, renderer: "svg", loop: true, autoplay: true, animationData: data });
      animation.setSpeed(lottieSpeed);
      lottieAnimation.current = animation;
      const frames = Math.max(0, Number(data.op ?? 0) - Number(data.ip ?? 0));
      const fps = Math.max(1, Number(data.fr ?? 60));
      setLottieInfo({ frames, seconds: frames / fps, layers: data.layers?.length ?? 0 });
      setNotice(t("Lottie 动画已加载。", "Lottie animation loaded."));
    });
  }

  async function renderBarcode() {
    await perform(async () => {
      const canvas = barcodeCanvas.current;
      if (!canvas) return;
      const module = await import("bwip-js");
      const bwip = module.default;
      bwip.toCanvas(canvas, {
        bcid: barcodeType,
        text: barcodeText,
        scale: 4,
        height: barcodeType === "qrcode" || barcodeType === "datamatrix" ? 28 : 16,
        includetext: barcodeType !== "qrcode" && barcodeType !== "datamatrix",
        textxalign: "center",
        backgroundcolor: "FFFFFF",
      });
      setNotice(t("条码已生成。", "Barcode generated."));
    });
  }

  async function exportBarcode() {
    const canvas = barcodeCanvas.current;
    if (!canvas) return;
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(Error("PNG export failed")), "image/png"));
    downloadBlob("LR-barcode.png", blob);
  }

  async function scanBarcode(file?: File) {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      setError(t("图片超过 12 MB。", "Image exceeds 12 MB."));
      return;
    }
    await perform(async () => {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      const url = URL.createObjectURL(file);
      try {
        try {
          const result = await reader.decodeFromImageUrl(url);
          setScanResult(result.getText());
        } catch (firstError) {
          const bitmap = await createImageBitmap(file);
          try {
            const scale = Math.max(2, Math.min(4, Math.ceil(1200 / Math.max(bitmap.width, bitmap.height))));
            const quiet = 48;
            const canvas = document.createElement("canvas");
            canvas.width = bitmap.width * scale + quiet * 2;
            canvas.height = bitmap.height * scale + quiet * 2;
            const context = canvas.getContext("2d", { willReadFrequently: true });
            if (!context) throw firstError;
            context.imageSmoothingEnabled = false;
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(bitmap, quiet, quiet, bitmap.width * scale, bitmap.height * scale);
            const result = reader.decodeFromCanvas(canvas);
            setScanResult(result.getText());
          } finally {
            bitmap.close();
          }
        }
        setNotice(t("识别完成。", "Barcode decoded."));
      } finally {
        URL.revokeObjectURL(url);
      }
    });
  }

  return (
    <section className={`visual-studio power-studio power-${id}`} aria-label={meta.en}>
      <button className="studio-back" aria-label="Close tool" onClick={onClose} disabled={busy}>← {t("返回工作台", "Back to studios")}</button>
      <div className="visual-hero power-hero">
        <div className="visual-hero-icon"><ToolIcon category={meta.category} /></div>
        <div>
          <span className="studio-kicker">LR POWER WORKSPACE / {id.toUpperCase()}</span>
          <h1>{en ? meta.en : meta.name}</h1>
          <p>{en ? meta.introEn : meta.intro}</p>
        </div>
        <a href={meta.repo} target="_blank" rel="noreferrer">{meta.engine} ↗</a>
      </div>
      {error && <div className="studio-error visual-error" role="alert">{error}</div>}
      {notice && <div className="visual-notice" role="status">{notice}</div>}

      {id === "quicktype" && <div className="visual-split power-code-layout">
        <section className="visual-panel visual-editor">
          <div className="visual-panel-head"><strong>JSON / SCHEMA</strong><span>LOCAL INPUT</span></div>
          <textarea aria-label="Quicktype JSON source" value={jsonSource} onChange={(event) => setJsonSource(event.target.value)} rows={20} spellCheck={false} />
          <div className="power-toolbar"><label>{t("目标语言", "Target language")}<select aria-label="Target language" value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)}>{languageOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="studio-primary" disabled={busy} onClick={() => void generateTypes()}>{t("生成模型", "Generate model")} →</button></div>
        </section>
        <section className="visual-panel power-code-output"><div className="visual-panel-head"><strong>GENERATED MODEL</strong><span>QUICKTYPE</span></div>{generatedCode ? <><pre data-testid="quicktype-output">{generatedCode}</pre><div className="visual-actions"><button onClick={() => download(`LRModel.${({typescript:"ts",python:"py",go:"go",java:"java",kotlin:"kt",rust:"rs",csharp:"cs",swift:"swift"} as Record<string,string>)[targetLanguage] ?? "txt"}`, generatedCode, "text/plain;charset=utf-8")}>{t("下载代码", "Download code")} ↓</button></div></> : <div className="visual-empty"><ToolIcon category="Code" /><strong>{t("贴一段 JSON，直接生成类型。", "Paste JSON and generate real types.")}</strong></div>}</section>
      </div>}

      {id === "charts" && <div className="visual-split power-chart-layout">
        <section className="visual-panel visual-editor"><div className="visual-panel-head"><strong>CSV / JSON DATA</strong><span>ECHARTS</span></div><textarea aria-label="Chart data source" value={chartSource} onChange={(event) => setChartSource(event.target.value)} rows={18} spellCheck={false} /><div className="power-toolbar"><label>{t("图表类型", "Chart type")}<select aria-label="Chart type" value={chartType} onChange={(event) => setChartType(event.target.value)}><option value="bar">Bar</option><option value="line">Line</option><option value="pie">Pie</option></select></label><button className="studio-primary" disabled={busy} onClick={() => void renderChart()}>{t("生成图表", "Render chart")} →</button></div></section>
        <section className="visual-panel power-chart-stage"><div className="visual-panel-head"><strong>INTERACTIVE CANVAS</strong><span>LOCAL RENDER</span></div><div ref={chartHost} className="chart-host" data-testid="chart-host" /><div className="visual-actions"><button disabled={!chartInstance.current} onClick={() => void exportChart()}>PNG ↓</button></div></section>
      </div>}

      {id === "math" && <div className="visual-split power-math-layout">
        <section className="visual-panel math-console"><div className="visual-panel-head"><strong>EXPRESSION ENGINE</strong><span>MATH.JS</span></div><label>{t("表达式", "Expression")}<textarea aria-label="Math expression" value={expression} onChange={(event) => setExpression(event.target.value)} rows={5} spellCheck={false} /></label><button className="studio-primary" disabled={busy} onClick={() => void calculate()}>{t("计算", "Evaluate")} →</button><output className="math-result" data-testid="math-result">{mathResult || "—"}</output></section>
        <section className="visual-panel matrix-console"><div className="visual-panel-head"><strong>MATRIX LAB</strong><span>DET · INV · TRANSPOSE</span></div><label>{t("矩阵 JSON", "Matrix JSON")}<textarea aria-label="Matrix JSON" value={matrixSource} onChange={(event) => setMatrixSource(event.target.value)} rows={6} spellCheck={false} /></label><div className="visual-actions"><button onClick={() => void matrixAction("det")}>det(A)</button><button onClick={() => void matrixAction("inv")}>A⁻¹</button><button onClick={() => void matrixAction("transpose")}>Aᵀ</button></div><pre className="matrix-result">{matrixResult || "—"}</pre></section>
      </div>}

      {id === "latex" && <div className="visual-split power-latex-layout">
        <section className="visual-panel visual-editor"><div className="visual-panel-head"><strong>LATEX SOURCE</strong><span>KATEX</span></div><textarea aria-label="LaTeX source" value={latexSource} onChange={(event) => setLatexSource(event.target.value)} rows={14} spellCheck={false} /><label className="toggle-row"><input type="checkbox" checked={displayMode} onChange={(event) => setDisplayMode(event.target.checked)} /> {t("块级公式", "Display mode")}</label><div className="visual-actions"><button className="studio-primary" disabled={busy} onClick={() => void renderFormula()}>{t("排版公式", "Render formula")} →</button><button onClick={() => download("LR-formula.tex", latexSource, "text/plain;charset=utf-8")}>.tex ↓</button></div></section>
        <section className="visual-panel formula-stage"><div className="visual-panel-head"><strong>TYPESET PREVIEW</strong><span>HTML + MATHML</span></div><div ref={formulaHost} className="formula-host" data-testid="formula-host" /><div className="visual-actions"><button onClick={() => void exportFormula()} disabled={!formulaHost.current?.textContent}>PNG ↓</button></div></section>
      </div>}

      {id === "lottie" && <div className="visual-split power-lottie-layout">
        <section className="visual-panel visual-editor"><div className="visual-panel-head"><strong>LOTTIE JSON</strong><span>BODYMOVIN</span></div><textarea aria-label="Lottie JSON source" value={lottieSource} onChange={(event) => setLottieSource(event.target.value)} rows={18} spellCheck={false} /><label className="inline-upload">{t("或加载 .json", "Or load .json")}<input type="file" accept="application/json,.json" onChange={(event) => { const file = event.target.files?.[0]; if (file && file.size <= 5_000_000) void file.text().then(setLottieSource); }} /></label><div className="power-toolbar"><label>{t("速度", "Speed")}<select aria-label="Lottie speed" value={lottieSpeed} onChange={(event) => { const speed = Number(event.target.value); setLottieSpeed(speed); lottieAnimation.current?.setSpeed(speed); }}><option value="0.5">0.5×</option><option value="1">1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label><button className="studio-primary" disabled={busy} onClick={() => void renderLottie()}>{t("加载动画", "Load animation")} →</button></div></section>
        <section className="visual-panel lottie-stage-panel"><div className="visual-panel-head"><strong>ANIMATION STAGE</strong><span>{lottieInfo.frames ? `${lottieInfo.frames}F · ${lottieInfo.seconds.toFixed(2)}S · ${lottieInfo.layers}L` : "LOTTIE"}</span></div><div ref={lottieHost} className="lottie-stage" data-testid="lottie-stage" /><div className="visual-actions"><button onClick={() => lottieAnimation.current?.play()}>▶ {t("播放", "Play")}</button><button onClick={() => lottieAnimation.current?.pause()}>Ⅱ {t("暂停", "Pause")}</button><button onClick={() => download("LR-animation.json", lottieSource, "application/json;charset=utf-8")}>JSON ↓</button></div></section>
      </div>}

      {id === "barcode" && <div className="visual-split power-barcode-layout">
        <section className="visual-panel barcode-maker"><div className="visual-panel-head"><strong>BARCODE MAKER</strong><span>BWIP-JS</span></div><label>{t("内容", "Content")}<input aria-label="Barcode content" value={barcodeText} onChange={(event) => setBarcodeText(event.target.value)} /></label><label>{t("制式", "Symbology")}<select aria-label="Barcode type" value={barcodeType} onChange={(event) => setBarcodeType(event.target.value)}><option value="code128">Code 128</option><option value="ean13">EAN-13</option><option value="qrcode">QR Code</option><option value="datamatrix">Data Matrix</option><option value="pdf417">PDF417</option></select></label><button className="studio-primary" disabled={busy || !barcodeText.trim()} onClick={() => void renderBarcode()}>{t("生成条码", "Generate barcode")} →</button><div className="barcode-canvas-shell"><canvas ref={barcodeCanvas} data-testid="barcode-canvas" /></div><div className="visual-actions"><button onClick={() => void exportBarcode()}>PNG ↓</button></div></section>
        <section className="visual-panel barcode-reader"><div className="visual-panel-head"><strong>IMAGE DECODER</strong><span>ZXING</span></div><label className="visual-file-picker"><span><strong>{t("上传条码图片识别", "Decode a barcode image")}</strong><small>PNG · JPEG · WebP</small></span><input aria-label="Barcode image" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void scanBarcode(event.target.files?.[0])} /></label><div className="scan-result"><small>DECODED VALUE</small><strong data-testid="scan-result">{scanResult || "—"}</strong></div></section>
      </div>}
    </section>
  );
}
