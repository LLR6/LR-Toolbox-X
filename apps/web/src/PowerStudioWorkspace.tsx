import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { studios, type PowerStudioId } from "./studios.ts";
import { ToolIcon } from "./Icons.tsx";
import { download, downloadBlob } from "./storage.ts";
import "reveal.js/reveal.css";
import "./power-studios.css";

type Status = "success" | "error";
type ChartApi = { dispose(): void; resize(): void; getDataURL(options?: Record<string, unknown>): string };
type DeckApi = { initialize(): Promise<void>; destroy(): void };
type SqlDb = { run(sql: string): SqlDb; exec(sql: string): { columns: string[]; values: unknown[][] }[]; export(): Uint8Array; close(): void };

const CHART_DATA = `[
  {"name":"Mon","value":120},
  {"name":"Tue","value":200},
  {"name":"Wed","value":150},
  {"name":"Thu","value":80},
  {"name":"Fri","value":170}
]`;
const JSONATA_DATA = `{
  "orders": [
    {"product":"A","price":12,"qty":2},
    {"product":"B","price":8,"qty":5},
    {"product":"A","price":12,"qty":1}
  ]
}`;
const TEMPLATE_DATA = `{"name":"LR Toolbox X","tools":25,"local":true}`;
const SLIDES = `# LR Toolbox X
Local-first tools for real work.

---

# v0.11
- Data visualization
- Math & JSON query
- JWT / Barcode / SQLite

---

# Ship useful things
Keep the dashboard simple. Make each workspace powerful.`;
const SQLITE_SAMPLE = `CREATE TABLE scores(name TEXT, value INTEGER);
INSERT INTO scores VALUES ('LR', 42), ('Toolbox', 10), ('Local-first', 99);
SELECT * FROM scores ORDER BY value DESC;`;

function dataUrlBlob(value: string) {
  const [header, data] = value.split(",", 2);
  const mime = /data:([^;]+)/.exec(header)?.[1] || "application/octet-stream";
  const bytes = Uint8Array.from(atob(data), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}

function pretty(value: unknown) {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

export function PowerStudioWorkspace({
  id,
  en,
  onClose,
  onRecord,
}: {
  id: PowerStudioId;
  en: boolean;
  onClose: () => void;
  onRecord: (id: string, status: Status, ms: number) => void;
}) {
  const meta = studios.find((studio) => studio.id === id)!;
  const t = (zh: string, english: string) => (en ? english : zh);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const chartHost = useRef<HTMLDivElement>(null);
  const chartApi = useRef<ChartApi | null>(null);
  const [chartSource, setChartSource] = useState(CHART_DATA);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");

  const [mathExpression, setMathExpression] = useState("sqrt(3^2 + 4^2) + 2 inch to cm");
  const [mathVariable, setMathVariable] = useState("x");
  const [mathResult, setMathResult] = useState("");
  const [mathDerivative, setMathDerivative] = useState("");

  const barcodeHost = useRef<SVGSVGElement>(null);
  const [barcodeText, setBarcodeText] = useState("LR-TOOLBOX-2026");
  const [barcodeFormat, setBarcodeFormat] = useState("CODE128");
  const [barcodeSvg, setBarcodeSvg] = useState("");

  const [jwtSource, setJwtSource] = useState("");
  const [jwtSecret, setJwtSecret] = useState("");
  const [jwtHeader, setJwtHeader] = useState("");
  const [jwtPayload, setJwtPayload] = useState("");
  const [jwtVerified, setJwtVerified] = useState<string>("");

  const [jsonInput, setJsonInput] = useState(JSONATA_DATA);
  const [jsonataExpression, setJsonataExpression] = useState("orders.{'product': product, 'total': price * qty}");
  const [jsonataOutput, setJsonataOutput] = useState("");

  const [templateSource, setTemplateSource] = useState("<h1>{{name}}</h1><p>{{tools}} tools · Local: {{local}}</p>");
  const [templateData, setTemplateData] = useState(TEMPLATE_DATA);
  const [templateOutput, setTemplateOutput] = useState("");

  const slidesHost = useRef<HTMLDivElement>(null);
  const deckApi = useRef<DeckApi | null>(null);
  const [slidesSource, setSlidesSource] = useState(SLIDES);

  const sqlDb = useRef<SqlDb | null>(null);
  const [sqlFileName, setSqlFileName] = useState("");
  const [sqlSource, setSqlSource] = useState(SQLITE_SAMPLE);
  const [sqlColumns, setSqlColumns] = useState<string[]>([]);
  const [sqlRows, setSqlRows] = useState<unknown[][]>([]);

  useEffect(() => {
    return () => {
      chartApi.current?.dispose();
      deckApi.current?.destroy();
      sqlDb.current?.close();
    };
  }, []);

  useEffect(() => {
    const resize = () => chartApi.current?.resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

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

  async function renderChart() {
    await perform(async () => {
      const values = JSON.parse(chartSource) as { name: string; value: number }[];
      if (!Array.isArray(values) || !values.length) throw Error(t("请输入非空数据数组", "Enter a non-empty data array"));
      if (values.length > 5000) throw Error(t("最多 5000 个数据点", "Maximum 5,000 data points"));
      const echarts = await import("echarts");
      if (!chartHost.current) throw Error("Chart host unavailable");
      chartApi.current?.dispose();
      const chart = echarts.init(chartHost.current, undefined, { renderer: "canvas" });
      chartApi.current = chart as unknown as ChartApi;
      const names = values.map((item) => String(item.name));
      const nums = values.map((item) => Number(item.value));
      chart.setOption(
        chartType === "pie"
          ? {
              tooltip: { trigger: "item" },
              series: [{ type: "pie", radius: ["42%", "72%"], data: values.map((item) => ({ name: item.name, value: Number(item.value) })) }],
            }
          : {
              tooltip: { trigger: "axis" },
              grid: { left: 42, right: 24, top: 28, bottom: 44 },
              xAxis: { type: "category", data: names },
              yAxis: { type: "value" },
              series: [{ type: chartType, data: nums, smooth: chartType === "line" }],
            },
      );
      setNotice(t("交互图表已在本地生成。", "Interactive chart rendered locally."));
    });
  }

  async function exportChart() {
    if (!chartApi.current) return;
    const data = chartApi.current.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: "#111827" });
    downloadBlob("lr-chart.png", dataUrlBlob(data));
  }

  async function calculateMath() {
    await perform(async () => {
      if (mathExpression.length > 5000) throw Error(t("表达式过长", "Expression is too long"));
      const math = await import("mathjs");
      const value = math.evaluate(mathExpression);
      setMathResult(math.format(value, { precision: 14 }));
      try {
        setMathDerivative(math.derivative(mathExpression, mathVariable).toString());
      } catch {
        setMathDerivative(t("该表达式不适合符号求导", "This expression is not suitable for symbolic differentiation"));
      }
      setNotice(t("计算完成。", "Calculation complete."));
    });
  }

  async function renderBarcode() {
    await perform(async () => {
      if (!barcodeText || barcodeText.length > 256) throw Error(t("条码内容需为 1–256 字符", "Barcode content must be 1–256 characters"));
      const mod = await import("jsbarcode");
      const JsBarcode = mod.default as unknown as (target: SVGSVGElement, value: string, options: Record<string, unknown>) => void;
      if (!barcodeHost.current) throw Error("Barcode host unavailable");
      barcodeHost.current.replaceChildren();
      JsBarcode(barcodeHost.current, barcodeText, {
        format: barcodeFormat,
        lineColor: "#0b1220",
        background: "#ffffff",
        width: 2,
        height: 96,
        margin: 18,
        displayValue: true,
      });
      setBarcodeSvg(new XMLSerializer().serializeToString(barcodeHost.current));
      setNotice(t("条形码已生成。", "Barcode generated."));
    });
  }

  async function inspectJwt() {
    await perform(async () => {
      if (!jwtSource.trim()) throw Error(t("请输入 JWT", "Enter a JWT"));
      if (jwtSource.length > 20000) throw Error(t("JWT 过长", "JWT is too long"));
      const jose = await import("jose");
      setJwtHeader(JSON.stringify(jose.decodeProtectedHeader(jwtSource.trim()), null, 2));
      setJwtPayload(JSON.stringify(jose.decodeJwt(jwtSource.trim()), null, 2));
      setJwtVerified("");
      if (jwtSecret) {
        const result = await jose.jwtVerify(jwtSource.trim(), new TextEncoder().encode(jwtSecret), {
          algorithms: ["HS256", "HS384", "HS512"],
        });
        setJwtVerified(t(`签名有效 · ${String(result.protectedHeader.alg)}`, `Signature valid · ${String(result.protectedHeader.alg)}`));
      }
      setNotice(t("JWT 仅在本地解析；未输入密钥时不会声称签名有效。", "JWT parsed locally; no signature-valid claim is made without a key."));
    });
  }

  async function runJsonata() {
    await perform(async () => {
      if (jsonInput.length > 1000000 || jsonataExpression.length > 10000) throw Error(t("输入超过本地安全限制", "Input exceeds local safety limits"));
      const data = JSON.parse(jsonInput);
      const { default: jsonata } = await import("jsonata");
      const expression = jsonata(jsonataExpression);
      const result = await expression.evaluate(data);
      setJsonataOutput(pretty(result));
      setNotice(t("JSON 查询/转换完成。", "JSON query/transform complete."));
    });
  }

  async function renderTemplate() {
    await perform(async () => {
      if (templateSource.length > 100000 || templateData.length > 1000000) throw Error(t("模板或数据过大", "Template or data is too large"));
      const data = JSON.parse(templateData);
      const mod = await import("handlebars");
      const Handlebars = mod.default;
      const compiled = Handlebars.compile(templateSource, { strict: true, noEscape: false });
      const rendered = compiled(data);
      setTemplateOutput(rendered);
      setNotice(t("模板已本地渲染；预览会再次进行 HTML 清理。", "Template rendered locally; preview is sanitized again."));
    });
  }

  async function renderSlides() {
    await perform(async () => {
      if (!slidesHost.current) throw Error("Slides host unavailable");
      if (slidesSource.length > 100000) throw Error(t("演示稿最多 10 万字符", "Slides are limited to 100,000 characters"));
      deckApi.current?.destroy();
      const [{ default: Reveal }, { marked }] = await Promise.all([import("reveal.js"), import("marked")]);
      const blocks = slidesSource.split(/\n\s*---\s*\n/g).slice(0, 80);
      const sections = blocks
        .map((block) => `<section>${DOMPurify.sanitize(marked.parse(block) as string, { FORBID_TAGS: ["script", "iframe", "object", "embed", "form"], FORBID_ATTR: ["onload", "onclick", "onerror", "srcset"] })}</section>`)
        .join("");
      slidesHost.current.querySelector(".slides")!.innerHTML = sections;
      const RevealCtor = Reveal as unknown as new (root: HTMLElement, options: Record<string, unknown>) => DeckApi;
      const deck = new RevealCtor(slidesHost.current, { embedded: true, controls: true, progress: true, hash: false, transition: "slide" });
      deckApi.current = deck;
      await deck.initialize();
      setNotice(t(`已生成 ${blocks.length} 页演示稿。`, `${blocks.length} slides rendered.`));
    });
  }

  async function ensureSqlDb(file?: File) {
    const { default: initSqlJs } = await import("sql.js/dist/sql-wasm-inline.js");
    const SQL = await initSqlJs();
    sqlDb.current?.close();
    const data = file ? new Uint8Array(await file.arrayBuffer()) : undefined;
    sqlDb.current = new SQL.Database(data) as unknown as SqlDb;
    setSqlFileName(file?.name || t("临时内存数据库", "Temporary in-memory database"));
  }

  async function openSqlite(file: File | undefined) {
    if (!file) return;
    await perform(async () => {
      if (file.size > 30000000) throw Error(t("SQLite 文件最大 30 MB", "SQLite file limit is 30 MB"));
      await ensureSqlDb(file);
      setSqlColumns([]);
      setSqlRows([]);
      setNotice(t("数据库已在浏览器内存中打开。", "Database opened in browser memory."));
    });
  }

  async function runSql() {
    await perform(async () => {
      if (!sqlDb.current) await ensureSqlDb();
      if (sqlSource.length > 100000) throw Error(t("SQL 最多 10 万字符", "SQL is limited to 100,000 characters"));
      const results = sqlDb.current!.exec(sqlSource);
      const last = results.at(-1);
      setSqlColumns(last?.columns || []);
      setSqlRows((last?.values || []).slice(0, 1000));
      setNotice(t(`执行完成；结果预览 ${Math.min(last?.values.length || 0, 1000)} 行。`, `Executed; previewing ${Math.min(last?.values.length || 0, 1000)} rows.`));
    });
  }

  function exportSqlite() {
    if (!sqlDb.current) return;
    const bytes = sqlDb.current.export();
    const copy = new Uint8Array(bytes);
    downloadBlob("lr-toolbox.sqlite", new Blob([copy.buffer], { type: "application/vnd.sqlite3" }));
  }

  const commonHeader = (
    <>
      <button className="studio-back" aria-label="Close tool" onClick={onClose} disabled={busy}>← {t("返回工作台", "Back to studios")}</button>
      <div className="power-hero">
        <div className="power-hero-icon"><ToolIcon category={meta.category} /></div>
        <div>
          <span>LR POWER WORKSPACE / {id.toUpperCase()}</span>
          <h1>{en ? meta.en : meta.name}</h1>
          <p>{en ? meta.introEn : meta.intro}</p>
        </div>
        <a href={meta.repo} target="_blank" rel="noreferrer">{meta.engine} ↗</a>
      </div>
      {(error || notice) && <div className={error ? "power-status error" : "power-status"} role="status">{error || notice}</div>}
    </>
  );

  return (
    <section className={`power-studio power-${id}`} aria-label={meta.en}>
      {commonHeader}

      {id === "charts" && (
        <div className="power-grid">
          <div className="power-panel editor-panel">
            <div className="panel-title"><strong>{t("数据与图表类型", "Data & chart type")}</strong><span>JSON → ECharts</span></div>
            <select value={chartType} onChange={(e) => setChartType(e.target.value as typeof chartType)}><option value="bar">Bar</option><option value="line">Line</option><option value="pie">Pie</option></select>
            <textarea aria-label="Chart data" value={chartSource} onChange={(e) => setChartSource(e.target.value)} />
            <div className="power-actions"><button disabled={busy} onClick={() => void renderChart()}>{t("生成图表", "Render chart")}</button><button disabled={!chartApi.current} onClick={() => void exportChart()}>PNG</button></div>
          </div>
          <div className="power-panel preview-panel"><div className="panel-title"><strong>{t("交互画布", "Interactive canvas")}</strong><span>Apache ECharts</span></div><div className="chart-host" ref={chartHost} /></div>
        </div>
      )}

      {id === "math" && (
        <div className="power-grid">
          <div className="power-panel editor-panel"><div className="panel-title"><strong>{t("表达式", "Expression")}</strong><span>Math.js</span></div><textarea aria-label="Math expression" value={mathExpression} onChange={(e) => setMathExpression(e.target.value)} /><label>{t("求导变量", "Derivative variable")}<input value={mathVariable} onChange={(e) => setMathVariable(e.target.value)} /></label><button disabled={busy} onClick={() => void calculateMath()}>{t("计算", "Calculate")}</button></div>
          <div className="power-panel result-panel"><div className="metric-card"><span>{t("结果", "Result")}</span><strong>{mathResult || "—"}</strong></div><div className="code-card"><span>{t("符号求导", "Symbolic derivative")}</span><pre>{mathDerivative || "—"}</pre></div></div>
        </div>
      )}

      {id === "barcode" && (
        <div className="power-grid">
          <div className="power-panel editor-panel"><div className="panel-title"><strong>{t("条码内容", "Barcode content")}</strong><span>JsBarcode</span></div><input aria-label="Barcode content" value={barcodeText} onChange={(e) => setBarcodeText(e.target.value)} /><select value={barcodeFormat} onChange={(e) => setBarcodeFormat(e.target.value)}><option>CODE128</option><option>CODE39</option><option>EAN13</option><option>EAN8</option><option>UPC</option><option>ITF14</option></select><div className="power-actions"><button disabled={busy} onClick={() => void renderBarcode()}>{t("生成", "Generate")}</button><button disabled={!barcodeSvg} onClick={() => download("lr-barcode.svg", barcodeSvg, "image/svg+xml")}>SVG</button></div></div>
          <div className="power-panel barcode-preview"><svg ref={barcodeHost} aria-label="Barcode preview" /></div>
        </div>
      )}

      {id === "jwt" && (
        <div className="power-grid">
          <div className="power-panel editor-panel"><div className="panel-title"><strong>JWT / JWS</strong><span>panva/jose</span></div><textarea aria-label="JWT token" placeholder="eyJ..." value={jwtSource} onChange={(e) => setJwtSource(e.target.value)} /><label>{t("可选 HMAC 密钥（仅用于 HS256/384/512 验签）", "Optional HMAC secret (HS256/384/512 verification only)")}<input type="password" value={jwtSecret} onChange={(e) => setJwtSecret(e.target.value)} /></label><button disabled={busy} onClick={() => void inspectJwt()}>{t("解析 / 验证", "Inspect / verify")}</button></div>
          <div className="power-panel result-panel"><div className="code-card"><span>Header</span><pre>{jwtHeader || "—"}</pre></div><div className="code-card"><span>Payload</span><pre>{jwtPayload || "—"}</pre></div>{jwtVerified && <div className="verify-ok">✓ {jwtVerified}</div>}</div>
        </div>
      )}

      {id === "jsonata" && (
        <div className="power-grid three">
          <div className="power-panel editor-panel"><div className="panel-title"><strong>JSON</strong><span>Input</span></div><textarea aria-label="JSONata input" value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} /></div>
          <div className="power-panel editor-panel"><div className="panel-title"><strong>JSONata</strong><span>Expression</span></div><textarea aria-label="JSONata expression" value={jsonataExpression} onChange={(e) => setJsonataExpression(e.target.value)} /><button disabled={busy} onClick={() => void runJsonata()}>{t("运行转换", "Run transform")}</button></div>
          <div className="power-panel result-panel"><div className="panel-title"><strong>{t("结果", "Result")}</strong><button disabled={!jsonataOutput} onClick={() => download("jsonata-result.json", jsonataOutput, "application/json")}>JSON</button></div><pre className="big-pre">{jsonataOutput || "—"}</pre></div>
        </div>
      )}

      {id === "template" && (
        <div className="power-grid three">
          <div className="power-panel editor-panel"><div className="panel-title"><strong>Handlebars</strong><span>Template</span></div><textarea aria-label="Template source" value={templateSource} onChange={(e) => setTemplateSource(e.target.value)} /></div>
          <div className="power-panel editor-panel"><div className="panel-title"><strong>JSON</strong><span>Data</span></div><textarea aria-label="Template data" value={templateData} onChange={(e) => setTemplateData(e.target.value)} /><button disabled={busy} onClick={() => void renderTemplate()}>{t("渲染模板", "Render template")}</button></div>
          <div className="power-panel result-panel"><div className="panel-title"><strong>{t("安全预览", "Sanitized preview")}</strong><button disabled={!templateOutput} onClick={() => download("template-output.html", templateOutput, "text/html")}>HTML</button></div><div className="template-preview" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(templateOutput) }} /></div>
        </div>
      )}

      {id === "slides" && (
        <div className="power-grid">
          <div className="power-panel editor-panel"><div className="panel-title"><strong>{t("演示稿源码", "Slide source")}</strong><span>Markdown · --- split</span></div><textarea aria-label="Slide source" value={slidesSource} onChange={(e) => setSlidesSource(e.target.value)} /><div className="power-actions"><button disabled={busy} onClick={() => void renderSlides()}>{t("生成演示", "Render slides")}</button><button onClick={() => download("slides.md", slidesSource, "text/markdown")}>Markdown</button></div></div>
          <div className="power-panel slides-shell"><div className="reveal" ref={slidesHost}><div className="slides" /></div></div>
        </div>
      )}

      {id === "sqlite" && (
        <div className="power-grid">
          <div className="power-panel editor-panel"><div className="panel-title"><strong>SQLite</strong><span>{sqlFileName || t("未打开文件", "No file loaded")}</span></div><label className="file-drop">{t("打开 .sqlite / .db（可选）", "Open .sqlite / .db (optional)")}<input type="file" accept=".sqlite,.sqlite3,.db,application/vnd.sqlite3" onChange={(e) => void openSqlite(e.target.files?.[0])} /></label><textarea aria-label="SQLite query" value={sqlSource} onChange={(e) => setSqlSource(e.target.value)} /><div className="power-actions"><button disabled={busy} onClick={() => void runSql()}>{t("执行 SQL", "Run SQL")}</button><button disabled={!sqlDb.current} onClick={exportSqlite}>{t("导出数据库", "Export DB")}</button></div></div>
          <div className="power-panel result-panel"><div className="panel-title"><strong>{t("结果表", "Result table")}</strong><span>{sqlRows.length} rows</span></div>{sqlColumns.length ? <div className="table-scroll"><table><thead><tr>{sqlColumns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{sqlRows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{String(cell ?? "")}</td>)}</tr>)}</tbody></table></div> : <div className="empty-state">{t("执行查询后在这里查看结果。", "Run a query to inspect results here.")}</div>}</div>
        </div>
      )}
    </section>
  );
}
