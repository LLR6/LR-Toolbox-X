import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  actions,
  execute,
  AppError,
  type Action,
  type Input,
  type Json,
} from "../../../packages/registry/src/index.ts";
import {
  runWorkflow,
  type Step,
} from "../../../packages/registry/src/workflow.ts";
import { load, save, download, type Run } from "./storage.ts";
import "./style.css";
import "./dashboard.css";
import { Dashboard } from "./Dashboard.tsx";
import { ToolIcon, UiIcon } from "./Icons.tsx";
import "./polish.css";
const desktop = "__TAURI_INTERNALS__" in window;
const groups = [
  "All",
  "JSON",
  "Text",
  "Encoding",
  "Hash",
  "Developer",
  "Time",
  "Math",
  "Numbers",
  "Units",
  "Colors",
  "CSV",
  "Network",
  "Markdown",
  "Crypto",
];
const categoryLabels: Record<string, string> = {
  JSON: "JSON 与数据",
  Text: "文本处理",
  Encoding: "编码转换",
  Hash: "哈希校验",
  Developer: "开发工具",
  Time: "日期与时间",
  Math: "数学计算",
  Numbers: "数字工具",
  Units: "单位换算",
  Colors: "色彩工具",
  CSV: "表格转换",
  Network: "网络工具",
  Markdown: "Markdown",
  Crypto: "安全与加密",
  Files: "文件工具",
  System: "系统信息",
};
const defaultWorkflow: Step[] = [
  { action: "text.trim", input: { text: " Hello LR " } },
  { action: "encoding.base64.encode", input: {}, previousTo: "text" },
];
const invoke = async <T,>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T> => {
  const api = await import("@tauri-apps/api/core");
  return api.invoke<T>(command, args);
};
function App() {
  const [language, setLanguage] = useState(load<"zh" | "en">("language", "zh"));
  const en = language === "en";
  const t = (zh: string, english: string) => (en ? english : zh);
  const [theme, setTheme] = useState(
    load<"dark" | "light" | "system">("theme", "dark"),
  );
  const [page, setPage] = useState("home"),
    [category, setCategory] = useState("All"),
    [query, setQuery] = useState("");
  const [native, setNative] = useState<Action[]>([]),
    [nativeRoot, setNativeRoot] = useState("");
  const [active, setActive] = useState<Action | null>(null),
    [input, setInput] = useState<Input>({}),
    [output, setOutput] = useState<Json | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [favorite, setFavorite] = useState<string[]>(load("favorites", []));
  const [history, setHistory] = useState<Run[]>(load("history", []));
  const [notice, setNotice] = useState(""),
    [palette, setPalette] = useState(false),
    [workflow, setWorkflow] = useState(
      JSON.stringify(load("workflow", defaultWorkflow), null, 2),
    ),
    [workflowOutput, setWorkflowOutput] = useState("");
  const searchRef = useRef<HTMLInputElement>(null),
    fileRef = useRef<HTMLInputElement>(null);
  const all = [...actions, ...native];
  useEffect(() => {
    const preference = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme = (
        theme === "system" ? preference.matches : theme === "dark"
      )
        ? "dark"
        : "light";
    };
    apply();
    save("theme", theme);
    preference.addEventListener("change", apply);
    return () => preference.removeEventListener("change", apply);
  }, [theme]);
  useEffect(() => {
    save("language", language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);
  useEffect(() => {
    if (desktop)
      invoke<Action[]>("native_catalog")
        .then(setNative)
        .catch(() => setNotice("Native catalog unavailable"));
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      }
      if (e.key === "Escape") {
        setPalette(false);
        if (!busy) setActive(null);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [busy]);
  useEffect(() => {
    if (!active && !palette) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const controls = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input,textarea,select,[tabindex="0"]',
        ) ?? [],
      );
    (
      dialog?.querySelector<HTMLElement>("textarea,input,select") ??
      controls()[0]
    )?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = controls(),
        first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [active, palette]);
  const paletteMatches = all
    .filter((a) =>
      [a.name, a.nameEn, a.id, a.description]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .slice(0, 10);
  const matches = all.filter(
    (a) =>
      [a.id, a.name, a.nameEn, a.description, a.category, ...a.tags]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (category === "All" || a.category === category) &&
      (page !== "favorites" || favorite.includes(a.id)),
  );
  function choose(a: Action) {
    setActive(a);
    setInput({ ...a.example });
    setOutput(null);
    setError("");
    setPalette(false);
  }
  function toggle(id: string) {
    const next = favorite.includes(id)
      ? favorite.filter((x) => x !== id)
      : [...favorite, id];
    setFavorite(next);
    if (!save("favorites", next))
      setNotice(t("收藏保存失败", "Could not save favorites"));
  }
  async function run() {
    if (!active || busy) return;
    setBusy(true);
    setError("");
    setOutput(null);
    const start = performance.now();
    let status: Run["status"] = "success";
    try {
      let result: Json;
      if (native.some((a) => a.id === active.id)) {
        result = await invoke<Json>("run_native", {
          id: active.id,
          input,
          root: nativeRoot || null,
        });
      } else result = await execute(active.id, input);
      setOutput(result);
    } catch (e) {
      status = "error";
      const v = e as { code?: string; message?: string };
      setError(
        `${v.code ?? "ActionError"} · ${v.message ?? t("执行失败", "Execution failed")}`,
      );
    } finally {
      const elapsedMs = Math.round(performance.now() - start),
        next = [
          { id: active.id, time: new Date().toISOString(), status, elapsedMs },
          ...history,
        ].slice(0, 100);
      setHistory(next);
      if (!save("history", next))
        setNotice(t("历史记录保存失败", "Could not save history"));
      if (desktop)
        invoke("record_history", { id: active.id, status, elapsedMs }).catch(
          () => setNotice("SQLite history could not be saved"),
        );
      setBusy(false);
    }
  }
  async function workflowRun() {
    setWorkflowOutput("");
    try {
      const steps = JSON.parse(workflow);
      const result = await runWorkflow(steps);
      setWorkflowOutput(JSON.stringify(result, null, 2));
    } catch (e) {
      setWorkflowOutput((e as Error).message);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        typeof output === "string" ? output : JSON.stringify(output, null, 2),
      );
      setNotice(t("结果已复制", "Result copied"));
    } catch {
      setNotice(
        t(
          "剪贴板不可用，请选择结果复制",
          "Clipboard unavailable; select result to copy",
        ),
      );
    }
  }
  const nav = (id: string, label: string) => (
    <button
      className={page === id ? "nav selected" : "nav"}
      onClick={() => {
        setPage(id);
        setQuery("");
        setCategory("All");
      }}
    >
      <UiIcon name={id} />
      {label}
      {id === "favorites" && <small>{favorite.length}</small>}
    </button>
  );
  const navigate = (destination: string, group = "All") => {
    setPage(destination);
    setCategory(group);
    setQuery("");
  };
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <img src="./icon.svg" alt="LRX" />
          <div>
            LR Toolbox <b>X</b>
            <small>YOUR EVERYDAY SUPERPOWER</small>
          </div>
        </div>
        <button className="quick-search" onClick={() => setPalette(true)}>
          <UiIcon name="search" />
          {t("快速查找", "Quick search")}
          <kbd>⌘ K</kbd>
        </button>
        <div className="nav-label">WORKSPACE</div>
        {nav("home", t("工作台", "Workbench"))}
        {nav("tools", t("全部工具", "All tools"))}
        {nav("favorites", t("我的收藏", "Favorites"))}
        {nav("history", t("执行历史", "History"))}
        {nav("workflow", t("工作流", "Workflows"))}
        <div className="nav-label categories-label">
          {t("工具分类", "COLLECTIONS")}
        </div>
        <div className="collection-nav">
          {groups.slice(1).map((g) => (
            <button
              key={g}
              className={
                category === g && page === "tools" ? "nav selected" : "nav"
              }
              onClick={() => {
                setPage("tools");
                setCategory(g);
                setQuery("");
              }}
            >
              <ToolIcon category={g} className="nav-icon" flat />
              {en ? g : (categoryLabels[g] ?? g)}
              <small>{actions.filter((a) => a.category === g).length}</small>
            </button>
          ))}
          {desktop &&
            ["Files", "System"].map((g) => (
              <button
                key={g}
                className="nav"
                onClick={() => {
                  setPage("tools");
                  setCategory(g);
                }}
              >
                <ToolIcon category={g} className="nav-icon" flat />
                {en ? g : (categoryLabels[g] ?? g)}
              </button>
            ))}
        </div>
        <div className="sidebar-bottom">
          <div className="local">
            <span className="dot" />
            {t("本地运行 · 无需登录", "Local first · No account")}
          </div>
          {nav("settings", t("设置与关于", "Settings & About"))}
          <div className="profile">
            <div className="avatar">LR</div>
            <div>
              Personal workspace
              <small>v0.3.0 · {desktop ? "Desktop" : "Web"}</small>
            </div>
          </div>
        </div>
      </aside>
      <main>
        <header>
          <div className="breadcrumb">
            Workspace <span>/</span>{" "}
            {t(
              {
                home: "工作台",
                tools: "工具库",
                favorites: "收藏",
                history: "执行历史",
                workflow: "工作流",
                settings: "设置",
              }[page] ?? "工作台",
              page,
            )}
          </div>
          <div className="top-actions">
            <button className="header-search" onClick={() => setPalette(true)}>
              <UiIcon name="search" />
              <span>{t("搜索你的工具…", "Find your tools…")}</span>
              <kbd>⌘ K</kbd>
            </button>
            <span className="local-pill">
              <span className="dot" />
              LOCAL FIRST
            </span>
            <button
              title="Switch language"
              onClick={() => setLanguage(en ? "zh" : "en")}
            >
              {en ? "中文" : "EN"}
            </button>
            <button
              title="Switch theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <UiIcon name="theme" />
            </button>
          </div>
        </header>
        {page === "home" && (
          <Dashboard
            actions={all}
            history={history}
            favorites={favorite}
            en={en}
            choose={choose}
            navigate={navigate}
            query={query}
            setQuery={setQuery}
            toggle={toggle}
          />
        )}
        {(["tools", "favorites"].includes(page) ||
          (page === "home" && !!query)) && (
          <div className="content">
            {page !== "home" && (
              <>
                <div className="eyebrow">LESS FRICTION. MORE FLOW.</div>
                <div className="heading-row">
                  <div>
                    <h1>
                      {page === "favorites"
                        ? t("好工具，常在手边。", "Keep your favorites close.")
                        : t("小事交给工具，", "Small tasks, handled.")}
                      <br />
                      {page !== "favorites" && (
                        <span>
                          {t(
                            "专注真正重要的事。",
                            "Make room for what matters.",
                          )}
                        </span>
                      )}
                    </h1>
                    <p>
                      {t(
                        "你的日常工具箱。打开即用，数据留在本地。",
                        "Your everyday toolkit. Ready to run. Your data stays here.",
                      )}
                    </p>
                  </div>
                  <div className="cube" aria-hidden="true">
                    <div>
                      LR<span>✦</span>
                    </div>
                    <small>TOOLBOX / X</small>
                  </div>
                </div>
                <div className="searchbar">
                  <UiIcon name="search" />
                  <input
                    ref={searchRef}
                    aria-label={t("搜索工具", "Search tools")}
                    placeholder={t(
                      "搜索工具、操作或关键词…",
                      "Search tools, actions or keywords…",
                    )}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <kbd>CTRL K</kbd>
                </div>
                <div className="metrics">
                  <div>
                    <strong>{all.length}</strong>
                    <span>{t("可用 Actions", "Available actions")}</span>
                  </div>
                  <div>
                    <strong>{new Set(all.map((a) => a.category)).size}</strong>
                    <span>{t("工具分类", "Collections")}</span>
                  </div>
                  <div>
                    <strong>{history.length}</strong>
                    <span>{t("本地执行记录", "Local executions")}</span>
                  </div>
                  <div>
                    <strong>
                      100<span className="percent">%</span>
                    </strong>
                    <span>{t("离线核心工具", "Offline core tools")}</span>
                  </div>
                </div>
              </>
            )}
            <div className="section-title">
              <h2>
                {query
                  ? t("搜索结果", "Search results")
                  : page === "favorites"
                    ? t("我的收藏", "Favorites")
                    : t("为下一次灵感，备好工具", "Ready for your next idea")}
              </h2>
              <span>
                {matches.length} {t("个工具", "tools")} ↙
              </span>
            </div>
            <div className="filters">
              {groups.map((g) => (
                <button
                  key={g}
                  className={category === g ? "active" : ""}
                  onClick={() => setCategory(g)}
                >
                  {g === "All"
                    ? t("全部", "All tools")
                    : en
                      ? g
                      : (categoryLabels[g] ?? g)}
                </button>
              ))}
            </div>
            <div className="tool-grid">
              {matches.map((a) => (
                <article key={a.id} className="tool-card">
                  <div className="card-top">
                    <ToolIcon category={a.category} className="tool-icon" />
                    <button
                      aria-label={`${favorite.includes(a.id) ? "Unfavorite" : "Favorite"} ${a.id}`}
                      aria-pressed={favorite.includes(a.id)}
                      onClick={() => toggle(a.id)}
                      className={favorite.includes(a.id) ? "star on" : "star"}
                    >
                      <UiIcon name="favorites" />
                    </button>
                  </div>
                  <button
                    className="card-open"
                    data-testid={"action-" + a.id}
                    onClick={() => choose(a)}
                  >
                    <h3>{en ? a.nameEn : a.name}</h3>
                    <p>{en ? a.nameEn + " · " + a.id : a.description}</p>
                    <div className="card-foot">
                      <span>{a.category}</span>
                      <span>↗</span>
                    </div>
                  </button>
                </article>
              ))}
            </div>
            {!matches.length && (
              <div className="empty">
                {t(
                  "没有匹配的工具。试试 JSON、编码或时间戳。",
                  "No matching tools. Try JSON, encoding or timestamp.",
                )}
              </div>
            )}
            <footer>
              <span>
                <span className="dot" />{" "}
                {t(
                  "所有展示的工具均有真实执行器",
                  "Every listed tool has a real handler",
                )}
              </span>
              <span>LR OmniBox · Built for your flow.</span>
            </footer>
          </div>
        )}
        {page === "history" && (
          <div className="content">
            <h1>{t("执行历史", "Execution history")}</h1>
            <p>
              {t(
                "仅保存名称、时间、状态和耗时，不保存输入或结果。",
                "Only IDs, time, status and duration. No inputs or outputs.",
              )}
            </p>
            <button
              onClick={() => {
                setHistory([]);
                save("history", []);
                if (desktop)
                  invoke("clear_history").catch(() =>
                    setNotice("Could not clear SQLite history"),
                  );
              }}
            >
              {t("清空历史", "Clear history")}
            </button>
            <div className="history-list">
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const a = all.find((a) => a.id === h.id);
                    if (a) choose(a);
                  }}
                >
                  <span>
                    {h.status === "success" ? "✓" : "!"} {h.id}
                  </span>
                  <span>
                    {new Date(h.time).toLocaleString()} · {h.elapsedMs} ms
                  </span>
                </button>
              ))}
            </div>
            {!history.length && (
              <div className="empty">
                {t(
                  "运行工具后，记录会显示在这里。",
                  "Run a tool to see your history here.",
                )}
              </div>
            )}
          </div>
        )}
        {page === "workflow" && (
          <div className="content narrow">
            <div className="eyebrow">CONNECT YOUR ACTIONS</div>
            <h1>
              {t("把小工具，连成工作流。", "Connect actions into a flow.")}
            </h1>
            <p>
              {t(
                "安全工具顺序执行。previousTo 将上一步结果传入指定字段，出错即停止。最多 20 步。",
                "Safe actions run in order. previousTo binds the previous result. Stops on error. Maximum 20 steps.",
              )}
            </p>
            <textarea
              aria-label="Workflow JSON"
              className="workflow-editor"
              value={workflow}
              onChange={(e) => setWorkflow(e.target.value)}
            />
            <div className="button-row">
              <button className="primary" onClick={workflowRun}>
                {t("运行工作流", "Run workflow")} ↗
              </button>
              <button
                onClick={() => {
                  try {
                    const v = JSON.parse(workflow);
                    if (!Array.isArray(v) || v.length > 20)
                      throw Error("Invalid workflow");
                    save("workflow", v);
                    setNotice(t("已保存到本机", "Saved locally"));
                  } catch (e) {
                    setNotice((e as Error).message);
                  }
                }}
              >
                {t("保存", "Save")}
              </button>
              <button onClick={() => download("lrx-workflow.json", workflow)}>
                {t("导出", "Export")}
              </button>
              <button onClick={() => fileRef.current?.click()}>
                {t("导入", "Import")}
              </button>
              <input
                type="file"
                accept="application/json,.json"
                hidden
                ref={fileRef}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 1000000) {
                    setNotice("File exceeds 1 MB");
                    return;
                  }
                  try {
                    const v = JSON.parse(await f.text());
                    if (!Array.isArray(v) || v.length > 20)
                      throw Error("Invalid workflow");
                    setWorkflow(JSON.stringify(v, null, 2));
                  } catch {
                    setNotice("Invalid workflow JSON");
                  }
                  e.target.value = "";
                }}
              />
            </div>
            {workflowOutput && <pre role="status">{workflowOutput}</pre>}
          </div>
        )}
        {page === "settings" && (
          <div className="content narrow">
            <h1>{t("按你的方式工作。", "Make it your own.")}</h1>
            <div className="settings-card">
              <label>
                {t("语言", "Language")}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "zh" | "en")}
                >
                  <option value="zh">简体中文</option>
                  <option value="en">English</option>
                </select>
              </label>
              <label>
                {t("外观", "Appearance")}
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as typeof theme)}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </label>
              <p>
                {t(
                  "无账号、无跟踪。工具输入默认不保存、不上传。收藏、设置与不含内容的历史保存在本机。",
                  "No accounts, no tracking. Tool inputs are neither stored nor uploaded. Preferences and metadata-only history stay on this device.",
                )}
              </p>
              <button
                onClick={() =>
                  download(
                    "lrx-settings.json",
                    JSON.stringify(
                      { language, theme, favorites: favorite },
                      null,
                      2,
                    ),
                  )
                }
              >
                {t("导出设置和收藏", "Export settings & favorites")}
              </button>
            </div>
            <div className="settings-card">
              <h2>LR Toolbox X · 0.3.0</h2>
              <p>
                {all.length} {t("已实现 Action", "implemented actions")} ·{" "}
                {desktop ? "Tauri / Rust" : "React / Web"} · Apache-2.0
              </p>
              <p>
                {t(
                  "当前为首个开发里程碑。AI、插件和更多原生能力详见仓库路线图。",
                  "First development milestone. See the repository roadmap for AI, plugins and more native capabilities.",
                )}
              </p>
              <a
                href="https://github.com/LLR6/LR-Toolbox-X"
                target="_blank"
                rel="noreferrer"
              >
                GitHub ↗
              </a>{" "}
              ·{" "}
              <a href="./action-catalog.json" target="_blank" rel="noreferrer">
                Action Catalog ↗
              </a>
              <p>React MIT · Vite MIT · Ajv MIT · Tauri MIT / Apache-2.0</p>
            </div>
          </div>
        )}
      </main>
      {active && (
        <div
          className="overlay"
          onClick={() => {
            if (!busy) setActive(null);
          }}
        >
          <section
            className="runner"
            role="dialog"
            aria-modal="true"
            aria-label={active.nameEn}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="runner-head">
              <ToolIcon category={active.category} className="tool-icon" />
              <div>
                <h2>{en ? active.nameEn : active.name}</h2>
                <code>{active.id}</code>
              </div>
              <button
                disabled={busy}
                aria-label="Close tool"
                onClick={() => setActive(null)}
              >
                <UiIcon name="close" />
              </button>
            </div>
            <p>{active.description}</p>
            <div className="permission">
              {active.permissions.length
                ? `◈ ${active.permissions.join(", ")} · ${t("仅限授权目录内只读", "Read-only within granted directory")}`
                : t(
                    "✓ 本地安全操作 · 不上传数据",
                    "✓ Safe local action · No uploads",
                  )}
            </div>
            {active.permissions.length > 0 && (
              <label className="field">
                {t(
                  "授权根目录（绝对路径）",
                  "Granted root directory (absolute path)",
                )}
                <input
                  value={nativeRoot}
                  onChange={(e) => setNativeRoot(e.target.value)}
                  placeholder="/home/user/Documents"
                />
              </label>
            )}
            {Object.entries(active.input_schema.properties ?? {}).map(
              ([key, schema]) => (
                <label className="field" key={key}>
                  {key}
                  <span>
                    {schema.type}
                    {schema.minimum !== undefined
                      ? ` · ≥ ${schema.minimum}`
                      : ""}
                  </span>
                  {schema.enum ? (
                    <select
                      aria-label={key}
                      value={String(input[key] ?? "")}
                      onChange={(e) =>
                        setInput({ ...input, [key]: e.target.value })
                      }
                    >
                      {schema.enum.map((value) => (
                        <option key={String(value)} value={String(value)}>
                          {String(value)}
                        </option>
                      ))}
                    </select>
                  ) : schema.type === "string" ? (
                    <textarea
                      aria-label={key}
                      value={String(input[key] ?? "")}
                      onChange={(e) =>
                        setInput({ ...input, [key]: e.target.value })
                      }
                      spellCheck={false}
                      rows={key === "text" ? 6 : 2}
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
                        setInput({
                          ...input,
                          [key]:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                    />
                  )}
                </label>
              ),
            )}
            <div className="button-row">
              <button className="primary" disabled={busy} onClick={run}>
                {busy ? t("运行中…", "Running…") : t("运行工具", "Run action")}{" "}
                ↗
              </button>
              <button
                onClick={() => {
                  setInput({ ...active.example });
                  setError("");
                  setOutput(null);
                }}
              >
                {t("填入示例", "Load example")}
              </button>
            </div>
            {error && (
              <div role="alert" className="error">
                {error}
              </div>
            )}
            {output !== null && (
              <div className="result">
                <div className="result-head">
                  {t("执行结果", "Result")}
                  <div>
                    <button onClick={copy}>{t("复制", "Copy")}</button>
                    <button
                      onClick={() =>
                        download(
                          active.id + ".txt",
                          typeof output === "string"
                            ? output
                            : JSON.stringify(output, null, 2),
                          "text/plain",
                        )
                      }
                    >
                      {t("下载", "Download")}
                    </button>
                  </div>
                </div>
                <pre role="status">
                  {typeof output === "string"
                    ? output
                    : JSON.stringify(output, null, 2)}
                </pre>
              </div>
            )}
          </section>
        </div>
      )}
      {palette && (
        <div className="overlay" onClick={() => setPalette(false)}>
          <div
            className="palette"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              aria-label="Command search"
              placeholder={t("输入工具名或关键词…", "Find an action…")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && paletteMatches[0]) {
                  e.preventDefault();
                  choose(paletteMatches[0]);
                }
              }}
            />
            {paletteMatches.map((a) => (
              <button key={a.id} onClick={() => choose(a)}>
                <ToolIcon category={a.category} />
                <span>{en ? a.nameEn : a.name}</span>
                <code>{a.id}</code>
              </button>
            ))}
          </div>
        </div>
      )}
      {notice && (
        <button className="toast" role="status" onClick={() => setNotice("")}>
          {notice} ×
        </button>
      )}
    </div>
  );
}
class Boundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="content">
        <h1>Unable to open workspace</h1>
        <p>Reload the app to recover. Local data has not been removed.</p>
        <button onClick={() => location.reload()}>Reload</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById("root")!).render(
  <Boundary>
    <App />
  </Boundary>,
);
if ("serviceWorker" in navigator && !desktop && import.meta.env.PROD)
  navigator.serviceWorker
    .register("./sw.js")
    .catch(() => console.warn("Offline cache unavailable"));
void AppError;
