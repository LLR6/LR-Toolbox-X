import { ResultVisual } from "./ResultVisual.tsx";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type {
  Action,
  Input,
  Json,
} from "../../../packages/registry/src/types.ts";
import type { Run } from "./storage.ts";
import { ToolIcon, UiIcon } from "./Icons.tsx";
import "./workbench.css";

type Props = {
  action: Action;
  input: Input;
  output: Json | null;
  hasResult: boolean;
  error: string;
  busy: boolean;
  en: boolean;
  desktop: boolean;
  nativeRoot: string;
  favorite: boolean;
  history: Run[];
  related: Action[];
  setInput: (input: Input) => void;
  setRoot: (root: string) => void;
  onRun: () => void;
  onClose: () => void;
  onExample: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onFavorite: () => void;
  onChoose: (action: Action) => void;
};
function Syntax({ value }: { value: string }) {
  if (value.length > 200000) return <>{value}</>;
  try {
    JSON.parse(value);
  } catch {
    return <>{value}</>;
  }
  const tokens =
    /("(?:[^"\\]|\\.)*"|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}[\],:])/g;
  const parts: ReactNode[] = [];
  let at = 0;
  let match: RegExpExecArray | null;
  while ((match = tokens.exec(value)) && parts.length < 15000) {
    if (match.index > at) parts.push(value.slice(at, match.index));
    const token = match[0],
      rest = value.slice(tokens.lastIndex),
      kind = token.startsWith('"')
        ? /^\s*:/.test(rest)
          ? "key"
          : "string"
        : /^-?\d/.test(token)
          ? "number"
          : /^(true|false|null)$/.test(token)
            ? "literal"
            : "punctuation";
    parts.push(
      <span key={match.index} className={"syntax-" + kind}>
        {token}
      </span>,
    );
    at = tokens.lastIndex;
  }
  parts.push(value.slice(at));
  return <>{parts}</>;
}
export function Workbench(p: Props) {
  const { action, input, output, error, busy, en } = p;
  const t = (zh: string, english: string) => (en ? english : zh);
  const root = useRef<HTMLElement>(null),
    gutter = useRef<HTMLPreElement>(null),
    file = useRef<HTMLInputElement>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const applyExample = () => {
    setImportError("");
    p.onExample();
  };
  const [importError, setImportError] = useState("");
  const fields = Object.entries(action.input_schema.properties ?? {});
  const primary =
    fields.find(
      ([key, schema]) => schema.type === "string" && key === "text",
    ) ?? fields.find(([, schema]) => schema.type === "string" && !schema.enum);
  const primaryText = primary ? String(input[primary[0]] ?? "") : "";
  const lines = primaryText.split("\n").length,
    chars = Array.from(primaryText).length;
  const resultText = !p.hasResult
    ? ""
    : typeof output === "string"
      ? output
      : JSON.stringify(output, null, 2);
  const resultBytes = !p.hasResult
    ? 0
    : new TextEncoder().encode(resultText).length;
  const records = p.history.filter((h) => h.id === action.id).slice(0, 4);
  const state = busy
    ? "running"
    : error
      ? "error"
      : p.hasResult
        ? "success"
        : "ready";
  const stateLabel = {
    running: t("执行中", "Running"),
    error: t("执行失败", "Failed"),
    success: t("执行成功", "Completed"),
    ready: t("准备就绪", "Ready"),
  }[state];
  useEffect(() => {
    const frame = requestAnimationFrame(() => root.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [action.id]);
  return (
    <section
      className={"workbench run-" + state}
      role="region"
      aria-label={action.nameEn}
      ref={root}
      tabIndex={-1}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          if (!busy && !importError) p.onRun();
        }
      }}
    >
      <div className="workbench-path">
        <button aria-label="Close tool" onClick={p.onClose} disabled={busy}>
          <UiIcon name="back" />
          {t("返回工具箱", "Back to tools")}
        </button>
        <span>/</span>
        <span>{action.category}</span>
        <UiIcon name="chevron" />
        <strong>{en ? action.nameEn : action.name}</strong>
        <span className="workbench-local">
          <UiIcon name="shield" />
          {t("本地安全计算", "ON-DEVICE PROCESSING")}
        </span>
      </div>
      <div className="workbench-titlebar">
        <div className="workbench-identity">
          <ToolIcon category={action.category} />
          <div>
            <div className="workbench-overline">
              LR TOOLBOX X <span>/</span> {action.category.toUpperCase()}
            </div>
            <h1>{en ? action.nameEn : action.name}</h1>
            <p>{action.description}</p>
          </div>
        </div>
        <button
          className={"workbench-favorite" + (p.favorite ? " is-favorite" : "")}
          onClick={p.onFavorite}
          aria-label={`${p.favorite ? "Unfavorite" : "Favorite"} ${action.id}`}
          aria-pressed={p.favorite}
        >
          <UiIcon name="favorites" />
          {p.favorite ? t("已收藏", "Saved") : t("收藏工具", "Save tool")}
        </button>
      </div>
      <div className="workbench-flow">
        <span className="flow-node">
          <UiIcon name="input" />
          INPUT <b>{t("参数输入", "Input")}</b>
        </span>
        <i />
        <span className="flow-node">
          <UiIcon name="terminal" />
          LOCAL ENGINE <b>{t("本地执行器", "Local engine")}</b>
        </span>
        <i />
        <span className="flow-node">
          <UiIcon name="output" />
          OUTPUT <b>{t("执行结果", "Output")}</b>
        </span>
        <span className={"execution-state state-" + state}>
          <span className={busy ? "run-spinner" : "state-light"} />
          {stateLabel}
        </span>
      </div>
      <div className="workbench-grid">
        <div className="editor-pair">
          <section className="editor-panel input-panel">
            <div className="editor-panel-head">
              <span className="panel-index">01</span>
              <h2>{t("输入工作区", "Input workspace")}</h2>
              <span className="editor-format">
                {fields.length === 1 && primary ? "TEXT" : "PARAMETERS"}
              </span>
              <div className="editor-head-actions">
                <button onClick={applyExample} disabled={busy}>
                  <UiIcon name="example" />
                  {t("填入示例", "Load example")}
                </button>
                {primary && (
                  <button onClick={() => file.current?.click()} disabled={busy}>
                    <UiIcon name="upload" />
                    {t("导入", "Import")}
                  </button>
                )}
              </div>
            </div>
            {primary && (
              <input
                ref={file}
                hidden
                type="file"
                accept=".txt,.json,.csv,.md,.log,.yaml,.yml,text/*,application/json"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setImportError("");
                  try {
                    if (f.size > 1000000)
                      throw Error(
                        t("文件最大 1 MB。", "Maximum file size is 1 MB."),
                      );
                    const value = await f.text();
                    if (alive.current)
                      p.setInput({ ...input, [primary[0]]: value });
                  } catch (err) {
                    setImportError((err as Error).message);
                  }
                  e.target.value = "";
                }}
              />
            )}
            {action.permissions.length > 0 && (
              <div className="grant-field">
                <UiIcon name="shield" />
                <label>
                  {t("授权根目录（绝对路径）", "Granted root directory")}
                  <input
                    aria-label={t("授权根目录", "Granted root directory")}
                    value={p.nativeRoot}
                    onChange={(e) => p.setRoot(e.target.value)}
                    placeholder="/home/user/Documents"
                  />
                </label>
                <small>
                  {t(
                    "仅限授权目录内只读，不修改文件。",
                    "Read-only inside the granted directory.",
                  )}
                </small>
              </div>
            )}
            {!fields.length ? (
              <div className="no-input">
                <ToolIcon category={action.category} />
                <h3>{t("无需输入参数", "No parameters required")}</h3>
                <p>
                  {t(
                    "点击运行，即可读取当前设备的真实信息。",
                    "Run this action to read real information from this device.",
                  )}
                </p>
              </div>
            ) : fields.length === 1 && primary && !primary[1].enum ? (
              <div className="code-input-wrap">
                <pre className="line-gutter" ref={gutter} aria-hidden="true">
                  {Array.from(
                    { length: Math.min(lines, 2000) },
                    (_, i) => i + 1,
                  ).join("\n")}
                </pre>
                <textarea
                  aria-label={primary[0]}
                  value={primaryText}
                  onChange={(e) => {
                    setImportError("");
                    p.setInput({ ...input, [primary[0]]: e.target.value });
                  }}
                  onScroll={(e) => {
                    if (gutter.current)
                      gutter.current.scrollTop = e.currentTarget.scrollTop;
                  }}
                  spellCheck={false}
                  wrap="off"
                  placeholder={t(
                    "在这里输入或粘贴内容…",
                    "Type or paste your content here…",
                  )}
                />
              </div>
            ) : (
              <div className="parameter-form">
                {fields.map(([key, schema]) => (
                  <label className="workbench-field" key={key}>
                    <span>
                      <strong>{en ? key : (schema.title ?? key)}</strong>
                      <small>
                        {schema.enum ? t("选项", "Option") : schema.type}
                        {schema.minimum !== undefined
                          ? ` · ≥ ${schema.minimum}`
                          : ""}
                        {schema.maximum !== undefined
                          ? ` · ≤ ${schema.maximum}`
                          : ""}
                      </small>
                    </span>
                    {schema.enum ? (
                      <select
                        aria-label={key}
                        value={String(input[key] ?? "")}
                        onChange={(e) =>
                          p.setInput({ ...input, [key]: e.target.value })
                        }
                      >
                        {schema.enum.map((v) => (
                          <option key={String(v)} value={String(v)}>
                            {en
                              ? String(v)
                              : ((
                                  {
                                    asc: "升序",
                                    desc: "降序",
                                    text: "文本",
                                    number: "数值",
                                    equals: "等于",
                                    not_equals: "不等于",
                                    contains: "包含",
                                    empty: "为空",
                                    not_empty: "非空",
                                    greater: "大于",
                                    less: "小于",
                                  } as Record<string, string>
                                )[String(v)] ?? String(v))}
                          </option>
                        ))}
                      </select>
                    ) : schema.type === "string" &&
                      key !== "text" &&
                      ["CSV", "QR"].includes(action.category) ? (
                      <input
                        aria-label={key}
                        type="text"
                        value={String(input[key] ?? "")}
                        onChange={(e) =>
                          p.setInput({ ...input, [key]: e.target.value })
                        }
                      />
                    ) : schema.type === "string" ? (
                      <textarea
                        aria-label={key}
                        value={String(input[key] ?? "")}
                        rows={key === "text" ? 9 : 3}
                        spellCheck={false}
                        onChange={(e) =>
                          p.setInput({ ...input, [key]: e.target.value })
                        }
                      />
                    ) : (
                      <input
                        aria-label={key}
                        type="number"
                        step={schema.type === "integer" ? 1 : "any"}
                        min={schema.minimum}
                        max={schema.maximum}
                        value={String(input[key] ?? "")}
                        onChange={(e) =>
                          p.setInput({
                            ...input,
                            [key]:
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                          })
                        }
                      />
                    )}
                  </label>
                ))}
              </div>
            )}
            {importError && (
              <div className="import-error" role="alert">
                {importError}
              </div>
            )}
            <div className="editor-panel-foot">
              <span>
                <span className="editor-dot" />
                UTF-8
              </span>
              <span>
                {primary
                  ? `${lines} ${t("行", "lines")} · ${chars.toLocaleString()} ${t("字符", "characters")}`
                  : `${fields.length} ${t("个参数", "parameters")}`}
              </span>
              <span>{t("仅在本机处理", "Processed on device")}</span>
            </div>
          </section>
          <section className="editor-panel output-panel" aria-busy={busy}>
            <div className="editor-panel-head">
              <span className="panel-index">02</span>
              <h2>{t("输出工作区", "Output workspace")}</h2>
              <span className="editor-format">
                {action.output_schema.type.toUpperCase()}
              </span>
              <div className="editor-head-actions">
                <button disabled={!p.hasResult || busy} onClick={p.onCopy}>
                  <UiIcon name="copy" />
                  {t("复制", "Copy")}
                </button>
                <button disabled={!p.hasResult || busy} onClick={p.onDownload}>
                  <UiIcon name="download" />
                  {t("下载", "Download")}
                </button>
              </div>
            </div>
            {error ? (
              <div className="execution-error" role="alert">
                <div className="error-emblem">
                  <UiIcon name="alert" />
                </div>
                <span>EXECUTION ERROR</span>
                <h3>{t("这次运行未能完成", "This run could not complete")}</h3>
                <pre>{error}</pre>
                <p>
                  {t(
                    "检查左侧参数，修正后可重新运行。",
                    "Review the input parameters, then run again.",
                  )}
                </p>
              </div>
            ) : p.hasResult ? (
              <ResultVisual
                id={action.id}
                category={typeof output === "string" ? action.category : ""}
                value={resultText}
                en={en}
                source={
                  <div className="code-output">
                    <pre
                      role="status"
                      tabIndex={0}
                      aria-label={t("执行结果", "Result")}
                    >
                      <Syntax
                        value={resultText || t("（空文本）", "(empty text)")}
                      />
                    </pre>
                  </div>
                }
              />
            ) : (
              <div className="output-empty">
                <div className={"output-orbit" + (busy ? " processing" : "")}>
                  <span className="orbit-dot one" />
                  <span className="orbit-dot two" />
                  <span className="orbit-dot three" />
                  <div className="orbit-core">
                    <UiIcon name={busy ? "terminal" : "output"} />
                  </div>
                </div>
                <span className="output-eyebrow">
                  {busy
                    ? "PROCESSING ON DEVICE"
                    : "YOUR NEXT RESULT STARTS HERE"}
                </span>
                <h3>
                  {busy
                    ? t("正在本地执行…", "Running locally…")
                    : t("让工具接手这一步", "Let the tool take it from here")}
                </h3>
                <p>
                  {t(
                    "准备好输入后，点击「运行工具」。",
                    "Prepare your input, then choose Run action.",
                  )}
                  <br />
                  {t(
                    "结果会显示在这里，内容不上传。",
                    "Your result appears here. No content uploads.",
                  )}
                </p>
              </div>
            )}
            <div className="editor-panel-foot">
              <span
                className={
                  "result-indicator " + (p.hasResult ? "has-result" : "")
                }
              >
                <span className="editor-dot" />
                {p.hasResult
                  ? t("结果已生成", "Result generated")
                  : t("等待输出", "Awaiting output")}
              </span>
              <span>
                {p.hasResult
                  ? `${resultBytes.toLocaleString()} ${t("字节", "bytes")}`
                  : "—"}
              </span>
              <span>
                {p.hasResult && records[0]
                  ? `${records[0].elapsedMs} ms`
                  : "LOCAL"}
              </span>
            </div>
          </section>
          <div className="workbench-runbar">
            <div className="runbar-note">
              <UiIcon name="shield" />
              <span>
                {t(
                  "本地执行 · 不上传输入与结果",
                  "On-device execution · No input or output uploads",
                )}
                <small>
                  {t(
                    "历史仅保存工具名称、时间、状态和耗时。",
                    "History stores only tool ID, time, status and duration.",
                  )}
                </small>
              </span>
            </div>
            <button
              className="run-action-button"
              disabled={busy || !!importError}
              onClick={p.onRun}
            >
              {busy ? <span className="run-spinner" /> : <UiIcon name="play" />}
              {busy ? t("运行中…", "Running…") : t("运行工具", "Run action")}
              <kbd>⌘ / CTRL ↵</kbd>
            </button>
          </div>
        </div>
        <aside className="workbench-inspector">
          <section className="inspector-card">
            <div className="inspector-title">
              <UiIcon name="settings" />
              <h2>{t("工具信息", "Action details")}</h2>
              <span className="inspector-live">LOCAL</span>
            </div>
            <dl>
              <div>
                <dt>{t("运行环境", "Runtime")}</dt>
                <dd>{p.desktop ? "Desktop" : "Web"}</dd>
              </div>
              <div>
                <dt>{t("操作等级", "Risk level")}</dt>
                <dd>
                  {action.risk_level === "safe"
                    ? t("安全操作", "Safe")
                    : action.risk_level}
                </dd>
              </div>
              <div>
                <dt>{t("数据传输", "Data transfer")}</dt>
                <dd>{t("无", "None")}</dd>
              </div>
              <div>
                <dt>{t("最近耗时", "Last duration")}</dt>
                <dd>{records[0] ? `${records[0].elapsedMs} ms` : "—"}</dd>
              </div>
            </dl>
            <div className="action-identifier">
              <span>ACTION ID</span>
              <code>{action.id}</code>
            </div>
          </section>
          <section className="inspector-card">
            <div className="inspector-title">
              <UiIcon name="example" />
              <h2>{t("使用示例", "Example input")}</h2>
            </div>
            <pre className="inspector-example">
              <Syntax value={JSON.stringify(action.example, null, 2)} />
            </pre>
            <button
              className="apply-example"
              onClick={applyExample}
              disabled={busy}
            >
              {t("应用到输入区", "Use this example")}
              <UiIcon name="arrow" />
            </button>
          </section>
          <section className="inspector-card">
            <div className="inspector-title">
              <UiIcon name="history" />
              <h2>{t("最近执行", "Recent runs")}</h2>
              <span>{records.length}</span>
            </div>
            {records.length ? (
              records.map((r, i) => (
                <div className="inspector-run" key={r.time + i}>
                  <span className={"run-result-dot " + r.status}>
                    <UiIcon name={r.status === "success" ? "check" : "alert"} />
                  </span>
                  <div>
                    <strong>
                      {r.status === "success"
                        ? t("执行完成", "Completed")
                        : t("执行失败", "Failed")}
                    </strong>
                    <small>
                      {new Date(r.time).toLocaleTimeString(
                        en ? "en-US" : "zh-CN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        },
                      )}
                    </small>
                  </div>
                  <span>{r.elapsedMs} ms</span>
                </div>
              ))
            ) : (
              <p className="inspector-empty">
                {t(
                  "首次运行后，这里会显示真实执行记录。",
                  "Your execution records appear here after the first run.",
                )}
              </p>
            )}
          </section>
          {!!p.related.length && (
            <section className="inspector-card">
              <div className="inspector-title">
                <UiIcon name="tools" />
                <h2>{t("同类工具", "Related tools")}</h2>
              </div>
              {p.related.slice(0, 3).map((a) => (
                <button
                  className="related-tool"
                  key={a.id}
                  onClick={() => p.onChoose(a)}
                  disabled={busy}
                >
                  <ToolIcon category={a.category} />
                  <span>{en ? a.nameEn : a.name}</span>
                  <UiIcon name="external" />
                </button>
              ))}
            </section>
          )}
        </aside>
      </div>
      <div className="workbench-bottom">
        <span>
          <span className="editor-dot" />
          {t(
            "数据留在本地，专注你的创造。",
            "Your data stays here. Focus on what you create.",
          )}
        </span>
        <span>LR TOOLBOX X · LOCAL ENGINE</span>
      </div>
    </section>
  );
}
