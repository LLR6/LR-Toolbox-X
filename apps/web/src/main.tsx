import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
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
import { binaryResult, binaryBytes } from "./binary.ts";
import { load, save, download, downloadBlob, type Run } from "./storage.ts";
import "./style.css";
import "./dashboard.css";
import { UpdateNotice } from "./UpdateNotice.tsx";
import { Workbench } from "./Workbench.tsx";
import { Discovery, StudioCards } from "./Discovery.tsx";
import {
  studios,
  studioMatches,
  studioShortcut,
  type StudioId,
} from "./studios.ts";
const StudioWorkspace = lazy(() =>
  import("./StudioWorkspace.tsx").then((m) => ({ default: m.StudioWorkspace })),
);
import { ToolIcon, UiIcon } from "./Icons.tsx";
import "./polish.css";
import "./readability.css";
import "./experience.css";
import "./comfort.css";
import { DeployCenter } from "./DeployCenter.tsx";
import { TaskDesk } from "./TaskDesk.tsx";
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
  "QR",
  "Archive",
  "Diff",
  "YAML",
  "Code",
  "XML",
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
  CSV: "表格处理",
  QR: "二维码工具",
  Archive: "压缩与归档",
  Diff: "差异与补丁",
  YAML: "YAML 配置",
  Code: "代码排版",
  XML: "XML 文档",
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
  const [studio, setStudio] = useState<Exclude<StudioId, "sql"> | null>(null);
  const [page, setPage] = useState("home"),
    [category, setCategory] = useState("All"),
    [query, setQuery] = useState("");
  const [native, setNative] = useState<Action[]>([]),
    [nativeRoot, setNativeRoot] = useState("");
  const [active, setActive] = useState<Action | null>(null),
    [input, setInput] = useState<Input>({}),
    [output, setOutput] = useState<Json | null>(null),
    [hasResult, setHasResult] = useState(false),
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
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [busy]);
  useEffect(() => {
    if (!palette) return;
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
  }, [palette]);
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
  function openStudio(id: StudioId) {
    if (id === "sql") {
      choose(actions.find((a) => a.id === "sql.format")!);
      return;
    }
    setActive(null);
    setStudio(id);
    setPalette(false);
  }
  function choose(a: Action) {
    setStudio(null);
    setActive(a);
    setInput({ ...a.example });
    setOutput(null);
    setHasResult(false);
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
    setHasResult(false);
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
      setHasResult(true);
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
        setStudio(null);
        setActive(null);
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
    setStudio(null);
    setActive(null);
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
        {nav("deploy", t("本地部署", "Local deployment"))}
        {nav("assistant", t("任务助手", "Task assistant"))}
        {nav("home", t("工作台", "Workbench"))}
        {nav("studios", t("创作工作台", "Creative studios"))}
        {nav("tools", t("全部工具", "All tools"))}
        {nav("favorites", t("我的收藏", "Favorites"))}
        {nav("history", t("执行历史", "History"))}
        {nav("workflow", t("工作流", "Workflows"))}
        <details>
          <summary>{t("按专业分类浏览", "Browse by category")}</summary>
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
                  setStudio(null);
                  setActive(null);
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
                    setActive(null);
                    setPage("tools");
                    setCategory(g);
                  }}
                >
                  <ToolIcon category={g} className="nav-icon" flat />
                  {en ? g : (categoryLabels[g] ?? g)}
                </button>
              ))}
          </div>
        </details>
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
              <small>v0.10.0 · {desktop ? "Desktop" : "Web"}</small>
            </div>
          </div>
        </div>
      </aside>
      <main>
        <header>
          <div className="breadcrumb">
            {active || studio ? "Tool workspace" : "Workspace"} <span>/</span>{" "}
            {studio
              ? en
                ? studios.find((s) => s.id === studio)!.en
                : studios.find((s) => s.id === studio)!.name
              : active
                ? en
                  ? active.nameEn
                  : active.name
                : t(
                    {
                      home: "工作台",
                      tools: "工具库",
                      studios: "创作工作台",
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
        {studio ? (
          <Suspense
            fallback={
              <div className="content" role="status">
                {t("正在打开工作台…", "Opening studio…")}
              </div>
            }
          >
            <StudioWorkspace
              key={studio}
              onOpen={openStudio}
              id={studio}
              en={en}
              onClose={() => setStudio(null)}
              onRecord={(id, status, elapsedMs) => {
                const next = [
                  { id, status, elapsedMs, time: new Date().toISOString() },
                  ...history,
                ].slice(0, 100);
                setHistory(next);
                save("history", next);
              }}
            />
          </Suspense>
        ) : active ? (
          <Workbench
            key={active.id}
            action={active}
            input={input}
            output={output}
            hasResult={hasResult}
            error={error}
            busy={busy}
            en={en}
            desktop={desktop}
            nativeRoot={nativeRoot}
            favorite={favorite.includes(active.id)}
            history={history}
            related={all.filter(
              (a) => a.category === active.category && a.id !== active.id,
            )}
            setInput={setInput}
            setRoot={setNativeRoot}
            onRun={run}
            onClose={() => setActive(null)}
            onExample={() => {
              setInput({ ...active.example });
              setError("");
              setOutput(null);
              setHasResult(false);
            }}
            onCopy={copy}
            onDownload={() => {
              const file = binaryResult(output);
              if (file) {
                downloadBlob(
                  file.filename,
                  new Blob([binaryBytes(file)], { type: file.mime }),
                );
                return;
              }
              const extensions: Record<string, [string, string]> = {
                "code.format.javascript": [
                  ".js",
                  "text/javascript;charset=utf-8",
                ],
                "code.format.typescript": [".ts", "text/plain;charset=utf-8"],
                "code.format.css": [".css", "text/css;charset=utf-8"],
                "code.format.html": [".html", "text/html;charset=utf-8"],
                "xml.to.json": [".json", "application/json;charset=utf-8"],
                "xml.inspect": [".json", "application/json;charset=utf-8"],
                "markdown.render": [".html", "text/html;charset=utf-8"],
                "patch.create": [".patch", "text/x-diff;charset=utf-8"],
                "yaml.from.json": [".yaml", "application/yaml;charset=utf-8"],
                "yaml.to.json": [".json", "application/json;charset=utf-8"],
              };
              const format = extensions[active.id];
              if (format) {
                download(
                  active.id + format[0],
                  typeof output === "string"
                    ? output
                    : JSON.stringify(output, null, 2),
                  format[1],
                );
                return;
              }
              download(
                active.id +
                  (active.id === "qr.generate"
                    ? ".svg"
                    : active.category === "CSV" && typeof output === "string"
                      ? ".csv"
                      : ".txt"),
                typeof output === "string"
                  ? output
                  : JSON.stringify(output, null, 2),
                active.id === "qr.generate"
                  ? "image/svg+xml"
                  : active.category === "CSV" && typeof output === "string"
                    ? "text/csv;charset=utf-8"
                    : "text/plain",
              );
            }}
            onFavorite={() => toggle(active.id)}
            onChoose={choose}
            onExtract={(path) => {
              const tool = actions.find((a) => a.id === "archive.zip.extract");
              if (tool) {
                choose(tool);
                setInput({ text: input.text, path });
              }
            }}
          />
        ) : (
          <>
            {page === "deploy" && <DeployCenter />}
            {page === "assistant" && <TaskDesk choose={choose} />}
            {page === "home" && (
              <Discovery
                openStudio={openStudio}
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
            {page === "studios" && (
              <div className="studio-library">
                <span className="studio-kicker">CREATE SOMETHING USEFUL</span>
                <h1>{t("从一个小任务开始。", "Start with one small task.")}</h1>
                <p>
                  {t(
                    "一组有介绍、有预览、按任务设计的特色工作台。",
                    "A growing set of guided workspaces with real previews.",
                  )}
                </p>
                <StudioCards en={en} open={openStudio} />
              </div>
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
                            ? t(
                                "好工具，常在手边。",
                                "Keep your favorites close.",
                              )
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
                        <strong>
                          {new Set(all.map((a) => a.category)).size}
                        </strong>
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
                {page === "tools" && category === "All" && (
                  <StudioCards en={en} open={openStudio} query={query} />
                )}
                <div className="section-title">
                  <h2>
                    {query
                      ? t("搜索结果", "Search results")
                      : page === "favorites"
                        ? t("我的收藏", "Favorites")
                        : t(
                            "为下一次灵感，备好工具",
                            "Ready for your next idea",
                          )}
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
                          className={
                            favorite.includes(a.id) ? "star on" : "star"
                          }
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
                        const target = studios.find(
                          (s) => "studio." + s.id === h.id,
                        );
                        if (a) choose(a);
                        else if (target) openStudio(target.id);
                      }}
                    >
                      <span>
                        {h.status === "success" ? "✓" : "!"}{" "}
                        {(() => {
                          const action = all.find((a) => a.id === h.id);
                          const target = studios.find(
                            (s) => "studio." + s.id === h.id,
                          );
                          return action
                            ? en
                              ? action.nameEn
                              : action.name
                            : target
                              ? en
                                ? target.en
                                : target.name
                              : h.id;
                        })()}
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
                  <button
                    onClick={() => download("lrx-workflow.json", workflow)}
                  >
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
                      onChange={(e) =>
                        setLanguage(e.target.value as "zh" | "en")
                      }
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
                  <h2>LR Toolbox X · 0.8.0</h2>
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
                  <a
                    href="./action-catalog.json"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Action Catalog ↗
                  </a>
                  <p>React MIT · Vite MIT · Ajv MIT · Tauri MIT / Apache-2.0</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
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
                if (e.key === "Enter") {
                  const target = studioShortcut(query);
                  if (target || paletteMatches[0]) {
                    e.preventDefault();
                    if (target) openStudio(target.id);
                    else choose(paletteMatches[0]);
                  }
                }
              }}
            />
            {studioMatches(query)
              .slice(0, 4)
              .map((s) => (
                <button key={s.id} onClick={() => openStudio(s.id)}>
                  <ToolIcon category={s.category} />
                  <span>{en ? s.en : s.name}</span>
                  <code>STUDIO</code>
                </button>
              ))}
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
    <UpdateNotice enabled={!desktop && import.meta.env.PROD} />
  </Boundary>,
);
void AppError;
