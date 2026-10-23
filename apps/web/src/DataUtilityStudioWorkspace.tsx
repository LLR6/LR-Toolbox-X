import { useMemo, useState } from "react";
import type { DataUtilityStudioId } from "./studios.ts";
import { studios } from "./studios.ts";
import { UiIcon } from "./Icons.tsx";
import { download, downloadBlob } from "./storage.ts";
import "./data-utility-studios.css";

type Status = "success" | "error";
type Props = {
  id: DataUtilityStudioId;
  en: boolean;
  onClose: () => void;
  onRecord: (id: string, status: Status, ms: number) => void;
};

type SqlResult = { columns: string[]; values: unknown[][] };
type PhoneReport = {
  e164: string;
  international: string;
  national: string;
  country: string;
  callingCode: string;
  type: string;
  valid: boolean;
  possible: boolean;
};
type ParsedMoment = {
  text: string;
  start: string;
  end?: string;
  index: number;
};

const SQL_EXAMPLE = `CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT, category TEXT, stars INTEGER);
INSERT INTO tools (name, category, stars) VALUES
  ('sql.js', 'database', 13600),
  ('jsondiffpatch', 'developer', 5300),
  ('libphonenumber-js', 'utility', 3000);
SELECT category, COUNT(*) AS tools, SUM(stars) AS stars
FROM tools
GROUP BY category
ORDER BY stars DESC;`;

const JSON_LEFT = `{
  "name": "LR Toolbox X",
  "version": "0.10",
  "features": ["PDF", "OCR", "Mermaid"]
}`;
const JSON_RIGHT = `{
  "name": "LR Toolbox X",
  "version": "0.11",
  "features": ["PDF", "OCR", "Mermaid", "SQLite"],
  "localFirst": true
}`;

function asText(value: unknown) {
  if (value === null) return "NULL";
  if (value instanceof Uint8Array) return `[BLOB ${value.byteLength} bytes]`;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function DataUtilityStudioWorkspace({ id, en, onClose, onRecord }: Props) {
  const meta = studios.find((studio) => studio.id === id)!;
  const t = (zh: string, english: string) => (en ? english : zh);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [sqlSource, setSqlSource] = useState(SQL_EXAMPLE);
  const [sqlResults, setSqlResults] = useState<SqlResult[]>([]);
  const [databaseBytes, setDatabaseBytes] = useState<Uint8Array | null>(null);

  const [jsonLeft, setJsonLeft] = useState(JSON_LEFT);
  const [jsonRight, setJsonRight] = useState(JSON_RIGHT);
  const [jsonDelta, setJsonDelta] = useState<unknown>(null);
  const [jsonPatched, setJsonPatched] = useState("");

  const [phoneInput, setPhoneInput] = useState("+1 408 555 0123");
  const [defaultCountry, setDefaultCountry] = useState("US");
  const [phoneReport, setPhoneReport] = useState<PhoneReport | null>(null);

  const [datePhrase, setDatePhrase] = useState("next Friday at 3:30 pm and remind me in two weeks");
  const [dateLanguage, setDateLanguage] = useState<"en" | "zh">("en");
  const [moments, setMoments] = useState<ParsedMoment[]>([]);

  const title = en ? meta.en : meta.name;
  const description = en ? meta.introEn : meta.intro;

  async function run(task: () => Promise<void> | void) {
    const started = performance.now();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await task();
      setNotice(t("处理完成，所有数据都留在当前设备。", "Done. Your data stayed on this device."));
      onRecord(id, "success", performance.now() - started);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(message);
      onRecord(id, "error", performance.now() - started);
    } finally {
      setBusy(false);
    }
  }

  async function runSql() {
    await run(async () => {
      const [{ default: initSqlJs }, wasm] = await Promise.all([
        import("sql.js"),
        import("sql.js/dist/sql-wasm.wasm?url"),
      ]);
      const SQL = await initSqlJs({ locateFile: () => wasm.default });
      const db = new SQL.Database();
      const results = db.exec(sqlSource) as SqlResult[];
      setSqlResults(results);
      setDatabaseBytes(db.export());
      db.close();
    });
  }

  async function compareJson() {
    await run(async () => {
      const mod = await import("jsondiffpatch");
      const left = JSON.parse(jsonLeft) as object;
      const right = JSON.parse(jsonRight) as object;
      const engine = mod.create({
        objectHash: (value: unknown) => {
          if (value && typeof value === "object") {
            const candidate = value as { id?: unknown; _id?: unknown };
            return String(candidate.id ?? candidate._id ?? JSON.stringify(value));
          }
          return String(value);
        },
      });
      const delta = engine.diff(left, right) ?? {};
      const patched = engine.patch(structuredClone(left), delta);
      setJsonDelta(delta);
      setJsonPatched(JSON.stringify(patched, null, 2));
    });
  }

  async function inspectPhone() {
    await run(async () => {
      const mod = await import("libphonenumber-js/max");
      const parsed = mod.parsePhoneNumberFromString(phoneInput, defaultCountry as import("libphonenumber-js").CountryCode);
      if (!parsed) throw Error(t("无法解析这个号码。", "Could not parse this phone number."));
      setPhoneReport({
        e164: parsed.number,
        international: parsed.formatInternational(),
        national: parsed.formatNational(),
        country: parsed.country ?? t("非地理号码", "Non-geographic"),
        callingCode: `+${parsed.countryCallingCode}`,
        type: parsed.getType() ?? t("未知", "Unknown"),
        valid: parsed.isValid(),
        possible: parsed.isPossible(),
      });
    });
  }

  async function parseDates() {
    await run(async () => {
      const chrono = await import("chrono-node");
      const parser = dateLanguage === "zh" ? chrono.zh.casual : chrono.casual;
      const results = parser.parse(datePhrase, new Date(), { forwardDate: true });
      setMoments(
        results.map((result) => ({
          text: result.text,
          index: result.index,
          start: result.start.date().toISOString(),
          end: result.end?.date().toISOString(),
        })),
      );
      if (results.length === 0) throw Error(t("没有识别到日期或时间。", "No date or time expression was recognized."));
    });
  }

  const deltaText = useMemo(() => (jsonDelta === null ? "" : JSON.stringify(jsonDelta, null, 2)), [jsonDelta]);

  return (
    <div className="studio-overlay data-utility-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <section className="data-studio-shell">
        <header className="data-studio-header">
          <div>
            <span className="data-studio-kicker">{meta.engine}</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close studio"><UiIcon name="close" /></button>
        </header>

        {id === "sqlite" && (
          <div className="data-studio-grid">
            <div className="data-panel editor-panel">
              <div className="panel-title"><strong>{t("SQL 脚本", "SQL script")}</strong><span>SQLite / WASM</span></div>
              <textarea aria-label="SQLite SQL" value={sqlSource} onChange={(event) => setSqlSource(event.target.value)} spellCheck={false} />
              <div className="data-actions">
                <button onClick={() => void runSql()} disabled={busy}>{busy ? t("运行中…", "Running…") : t("运行数据库", "Run database")}</button>
                <button className="secondary" disabled={!databaseBytes} onClick={() => databaseBytes && downloadBlob("lr-toolbox.sqlite", new Blob([databaseBytes as BlobPart], { type: "application/vnd.sqlite3" }))}>{t("导出 .sqlite", "Export .sqlite")}</button>
              </div>
            </div>
            <div className="data-panel result-panel">
              <div className="panel-title"><strong>{t("查询结果", "Query results")}</strong><span>{sqlResults.length} result set(s)</span></div>
              {sqlResults.length === 0 ? <div className="empty-state">{t("运行脚本后，这里会出现真实 SQLite 查询结果。", "Run the script to see real SQLite results here.")}</div> : sqlResults.map((result, index) => (
                <div className="sql-result" key={index}>
                  <table><thead><tr>{result.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{result.values.map((row, rowIndex) => <tr key={rowIndex}>{row.map((value, cellIndex) => <td key={cellIndex}>{asText(value)}</td>)}</tr>)}</tbody></table>
                </div>
              ))}
            </div>
          </div>
        )}

        {id === "jsondiff" && (
          <div className="data-studio-stack">
            <div className="json-pair">
              <label><strong>{t("旧 JSON", "Before JSON")}</strong><textarea aria-label="Before JSON" value={jsonLeft} onChange={(event) => setJsonLeft(event.target.value)} spellCheck={false} /></label>
              <label><strong>{t("新 JSON", "After JSON")}</strong><textarea aria-label="After JSON" value={jsonRight} onChange={(event) => setJsonRight(event.target.value)} spellCheck={false} /></label>
            </div>
            <div className="data-actions"><button onClick={() => void compareJson()} disabled={busy}>{t("生成差异与补丁", "Build diff & patch")}</button><button className="secondary" disabled={!deltaText} onClick={() => download("lr-json-delta.json", deltaText)}>{t("下载 Delta", "Download delta")}</button></div>
            <div className="json-output-grid">
              <div className="data-panel"><div className="panel-title"><strong>Delta</strong><span>jsondiffpatch</span></div><pre>{deltaText || t("等待比较", "Waiting for comparison")}</pre></div>
              <div className="data-panel"><div className="panel-title"><strong>{t("应用补丁后的 JSON", "Patched JSON")}</strong><span>{t("用于验证补丁可逆工作流", "Patch verification")}</span></div><pre>{jsonPatched || t("等待比较", "Waiting for comparison")}</pre></div>
            </div>
          </div>
        )}

        {id === "phone" && (
          <div className="phone-layout">
            <div className="data-panel phone-input-card">
              <div className="panel-title"><strong>{t("号码输入", "Phone input")}</strong><span>libphonenumber-js / max metadata</span></div>
              <label>{t("电话号码", "Phone number")}<input aria-label="Phone number" value={phoneInput} onChange={(event) => setPhoneInput(event.target.value)} /></label>
              <label>{t("默认国家（两位代码）", "Default country (2-letter code)")}<input aria-label="Default country" value={defaultCountry} maxLength={2} onChange={(event) => setDefaultCountry(event.target.value.toUpperCase())} /></label>
              <button onClick={() => void inspectPhone()} disabled={busy}>{t("解析号码", "Inspect number")}</button>
            </div>
            <div className="phone-report">
              {phoneReport ? <>
                <div className={`validity-orb ${phoneReport.valid ? "ok" : "warn"}`}><strong>{phoneReport.valid ? t("有效", "Valid") : t("未通过", "Invalid")}</strong><span>{phoneReport.possible ? t("号码长度可行", "Possible length") : t("号码长度异常", "Implausible length")}</span></div>
                <dl>{Object.entries({ E164: phoneReport.e164, [t("国际格式", "International")]: phoneReport.international, [t("本地格式", "National")]: phoneReport.national, [t("国家/地区", "Country")]: phoneReport.country, [t("国际区号", "Calling code")]: phoneReport.callingCode, [t("号码类型", "Type")]: phoneReport.type }).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
              </> : <div className="empty-state">{t("输入手机号后可查看标准化格式、国家、类型、有效性和可行性。", "Inspect standardized formats, country, type, validity and possibility.")}</div>}
            </div>
          </div>
        )}

        {id === "chrono" && (
          <div className="data-studio-grid chrono-layout">
            <div className="data-panel editor-panel">
              <div className="panel-title"><strong>{t("自然语言", "Natural language")}</strong><span>chrono-node</span></div>
              <textarea aria-label="Natural language date" value={datePhrase} onChange={(event) => setDatePhrase(event.target.value)} />
              <div className="language-pills"><button className={dateLanguage === "en" ? "active" : ""} onClick={() => setDateLanguage("en")}>English</button><button className={dateLanguage === "zh" ? "active" : ""} onClick={() => setDateLanguage("zh")}>中文</button></div>
              <button onClick={() => void parseDates()} disabled={busy}>{t("解析时间表达", "Parse date expressions")}</button>
            </div>
            <div className="data-panel timeline-panel">
              <div className="panel-title"><strong>{t("识别时间线", "Recognized timeline")}</strong><span>{moments.length} hit(s)</span></div>
              <ol className="natural-timeline">{moments.map((moment, index) => <li key={`${moment.index}-${index}`}><span className="timeline-dot"/><div><strong>“{moment.text}”</strong><time>{moment.start}</time>{moment.end && <small>→ {moment.end}</small>}</div></li>)}</ol>
              {moments.length === 0 && <div className="empty-state">{t("可以试试“下周五下午三点”或“next Friday at 3pm”。", "Try “next Friday at 3pm” or “in two weeks at noon”.")}</div>}
            </div>
          </div>
        )}

        {(notice || error) && <footer className={`data-studio-status ${error ? "error" : ""}`} role="status">{error || notice}</footer>}
      </section>
    </div>
  );
}
