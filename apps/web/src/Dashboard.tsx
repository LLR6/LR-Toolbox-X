import type { Action } from "../../../packages/registry/src/types.ts";
import type { Run } from "./storage.ts";

type Props = {
  actions: Action[];
  history: Run[];
  favorites: string[];
  en: boolean;
  choose: (a: Action) => void;
  navigate: (page: string, category?: string) => void;
  query: string;
  setQuery: (q: string) => void;
};
const glyphs: Record<string, string> = {
  JSON: "{}",
  Text: "Aa",
  Encoding: "⌘",
  Hash: "#",
  Developer: "</>",
  Time: "◷",
  Math: "∑",
  Numbers: "01",
  Units: "⇄",
  Colors: "◉",
  CSV: "▤",
  Network: "◎",
  Markdown: "M↓",
  Crypto: "◇",
};
export function ToolBadge({ category }: { category: string }) {
  return (
    <span className={"app-badge tone-" + category}>
      {glyphs[category] ?? "✦"}
    </span>
  );
}
export function Dashboard({
  actions,
  history,
  favorites,
  en,
  choose,
  navigate,
  query,
  setQuery,
}: Props) {
  const t = (zh: string, english: string) => (en ? english : zh);
  const pick = (id: string) => {
    const a = actions.find((a) => a.id === id);
    if (a) choose(a);
  };
  const popular = [
    "json.format",
    "encoding.base64.encode",
    "hash.sha256",
    "time.timestamp.iso",
    "text.stats",
    "developer.uuid.v4",
    "csv.to.json",
    "network.ipv4.inspect",
    "markdown.toc",
  ]
    .map((id) => actions.find((a) => a.id === id))
    .filter((a): a is Action => !!a);
  const recent = [...new Set(history.map((h) => h.id))]
    .slice(0, 4)
    .map((id) => actions.find((a) => a.id === id))
    .filter((a): a is Action => !!a);
  const categories = [
    {
      id: "Text",
      name: "文本处理",
      en: "Text tools",
      desc: "整理文字，释放表达",
      icon: "Aa",
    },
    {
      id: "JSON",
      name: "数据与 JSON",
      en: "Data & JSON",
      desc: "结构清晰，转换自如",
      icon: "{}",
    },
    {
      id: "Encoding",
      name: "编码与解码",
      en: "Encoding",
      desc: "让信息自由转换",
      icon: "⌘",
    },
    {
      id: "Developer",
      name: "开发者工具",
      en: "Developer",
      desc: "专注创造，高效开发",
      icon: "</>",
    },
    {
      id: "Math",
      name: "计算与换算",
      en: "Math & numbers",
      desc: "从日常到精确计算",
      icon: "∑",
    },
    {
      id: "workflow",
      name: "自动化工作流",
      en: "Workflows",
      desc: "串联操作，一次完成",
      icon: "⌥",
    },
  ];
  const success = history.filter((h) => h.status === "success").length;
  return (
    <div className={"dashboard-layout" + (query ? " searching" : "")}>
      <div className="dashboard-main">
        <section className="scenic-hero">
          <div className="hero-caption">
            <span className="hero-overline">
              YOUR PERSONAL PRODUCTIVITY SPACE
            </span>
            <h1>
              {t("让一切更高效", "Make every day flow.")}
              <span> ✦</span>
            </h1>
            <p>
              {t(
                "一个工具箱，连接每一次灵感与行动。",
                "One toolbox. Endless room to create.",
              )}
            </p>
          </div>
          <div className="hero-search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label={t("搜索工具", "Search tools")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(
                `搜索 ${actions.length} 个工具，开始你的高效时刻…`,
                `Search ${actions.length} tools to find your flow…`,
              )}
            />
            <kbd>CTRL K</kbd>
            <button
              aria-label={t("浏览工具", "Browse tools")}
              onClick={() => navigate("tools")}
            >
              →
            </button>
          </div>
          <div className="hero-chips">
            <span>{t("快速开始", "Quick start")}</span>
            {["json.format", "encoding.base64.encode", "hash.sha256"].map(
              (id) => {
                const a = actions.find((a) => a.id === id);
                return (
                  a && (
                    <button key={id} onClick={() => choose(a)}>
                      {en ? a.nameEn : a.name} ↗
                    </button>
                  )
                );
              },
            )}
          </div>
        </section>
        <div className="dashboard-section-head">
          <h2>{t("探索工具分类", "Explore collections")}</h2>
          <button onClick={() => navigate("tools")}>
            {t("全部工具", "All tools")} <span>→</span>
          </button>
        </div>
        <div className="collection-grid">
          {categories.map((c) => (
            <button
              className={"collection tone-" + c.id}
              key={c.id}
              onClick={() =>
                navigate(
                  c.id === "workflow" ? "workflow" : "tools",
                  c.id === "workflow" ? "All" : c.id,
                )
              }
            >
              <span className="collection-icon">{c.icon}</span>
              <strong>{en ? c.en : c.name}</strong>
              <small>
                {en
                  ? c.id === "workflow"
                    ? "Connect your actions"
                    : `${actions.filter((a) => a.category === c.id).length} local tools`
                  : c.desc}
              </small>
              <span className="collection-count">
                {c.id === "workflow"
                  ? "↗"
                  : actions.filter((a) => a.category === c.id).length +
                    " " +
                    t("个工具", "tools")}
              </span>
            </button>
          ))}
        </div>
        <div className="activity-grid">
          <section className="glass-panel">
            <div className="dashboard-section-head">
              <h2>{t("最近使用", "Recently used")}</h2>
              <button onClick={() => navigate("history")}>
                {t("查看全部", "View all")} →
              </button>
            </div>
            {recent.length ? (
              <div className="recent-grid">
                {recent.map((a) => (
                  <button
                    key={a.id}
                    className="compact-tool"
                    onClick={() => choose(a)}
                  >
                    <ToolBadge category={a.category} />
                    <span>
                      <strong>{en ? a.nameEn : a.name}</strong>
                      <small>{a.category}</small>
                    </span>
                    <span className="subtle-arrow">↗</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="welcome-state">
                <span className="welcome-orbit">◷</span>
                <div>
                  <strong>
                    {t(
                      "从一次小小的尝试开始",
                      "Your next great shortcut starts here",
                    )}
                  </strong>
                  <p>
                    {t(
                      "运行工具后，这里会为你保留快捷入口。",
                      "Your recently used tools will appear here.",
                    )}
                  </p>
                </div>
                <button onClick={() => pick("json.format")}>
                  {t("试试 JSON 格式化", "Try JSON format")} →
                </button>
              </div>
            )}
          </section>
          <section className="glass-panel task-panel">
            <div className="dashboard-section-head">
              <h2>{t("执行记录", "Activity")}</h2>
              <span className="live-tag">LOCAL</span>
            </div>
            {history.length ? (
              history.slice(0, 3).map((h, i) => (
                <div className="activity-row" key={i}>
                  <span
                    className={
                      h.status === "success" ? "status-good" : "status-error"
                    }
                  >
                    {h.status === "success" ? "✓" : "!"}
                  </span>
                  <span>
                    <strong>
                      {actions.find((a) => a.id === h.id)?.[
                        en ? "nameEn" : "name"
                      ] ?? h.id}
                    </strong>
                    <small>
                      {h.elapsedMs} ms ·{" "}
                      {new Date(h.time).toLocaleTimeString(
                        en ? "en-US" : "zh-CN",
                        { hour: "2-digit", minute: "2-digit" },
                      )}
                    </small>
                  </span>
                  <small>
                    {h.status === "success"
                      ? t("已完成", "Done")
                      : t("失败", "Failed")}
                  </small>
                </div>
              ))
            ) : (
              <div className="quiet-state">
                {t(
                  "准备就绪，等待你的下一项任务。",
                  "Ready for your next task.",
                )}
                <small>
                  {t("执行记录只留在当前设备", "Activity stays on this device")}
                </small>
              </div>
            )}
          </section>
        </div>
        <div className="dashboard-section-head">
          <h2>
            {t("精选实用工具", "Everyday essentials")}{" "}
            <span className="section-hint">
              {t("把时间留给更重要的事", "A little less busywork")}
            </span>
          </h2>
          <button onClick={() => navigate("favorites")}>
            ☆ {t("我的收藏", "Favorites")} {favorites.length}
          </button>
        </div>
        <div className="essentials-grid">
          {popular.map((a) => (
            <button
              className="essential-tool"
              data-testid={"dashboard-" + a.id}
              onClick={() => choose(a)}
              key={a.id}
            >
              <ToolBadge category={a.category} />
              <span>
                <strong>{en ? a.nameEn : a.name}</strong>
                <small>{en ? a.id : a.description}</small>
              </span>
              <span className="subtle-arrow">↗</span>
            </button>
          ))}
        </div>
        <section className="discover-banner">
          <div className="banner-symbol">✦</div>
          <div>
            <strong>
              {t("让工具配合你的节奏", "Make tools work at your pace")}
            </strong>
            <p>
              {t(
                `${actions.length} 个本地工具 · 无需账号 · 即开即用`,
                `${actions.length} local tools · No account · Ready when you are`,
              )}
            </p>
          </div>
          <button onClick={() => navigate("tools")}>
            {t("探索全部工具", "Explore all tools")} →
          </button>
        </section>
        <div className="dashboard-footer">
          <span>
            <i className="dot" />{" "}
            {t("本地计算，安心创造", "Local computation. Room to create.")}
          </span>
          <span>LR TOOLBOX X</span>
        </div>
      </div>
      <aside className="insight-rail">
        <section className="glass-panel day-panel">
          <span className="rail-label">TODAY / {new Date().getFullYear()}</span>
          <h2>
            {new Date().toLocaleDateString(en ? "en-US" : "zh-CN", {
              month: "long",
              day: "numeric",
            })}
          </h2>
          <span>
            {new Date().toLocaleDateString(en ? "en-US" : "zh-CN", {
              weekday: "long",
            })}
          </span>
          <div className="day-divider" />
          <p>
            {t("少一些繁琐，", "Less friction.")}
            <br />
            {t("多一些创造。", "More possibilities.")}
          </p>
          <small>MAKE SOMETHING GREAT.</small>
        </section>
        <section className="glass-panel">
          <div className="dashboard-section-head">
            <h2>{t("快捷工具", "Quick access")}</h2>
            <span>⌘</span>
          </div>
          <div className="quick-grid">
            {popular.slice(0, 6).map((a) => (
              <button key={a.id} onClick={() => choose(a)}>
                <ToolBadge category={a.category} />
                <span>{en ? a.nameEn : a.name}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="glass-panel usage-panel">
          <div className="dashboard-section-head">
            <h2>{t("我的工作空间", "Your workspace")}</h2>
            <span className="dot" />
          </div>
          <div className="usage-rings">
            <div className="usage-ring">
              <strong>{history.length}</strong>
              <small>{t("次本地执行", "local runs")}</small>
            </div>
            <div className="usage-summary">
              <strong>
                {favorites.length}
                <small>{t(" 个收藏", " favorites")}</small>
              </strong>
              <span>{t("执行成功率", "Success rate")}</span>
              <b>
                {history.length
                  ? Math.round((success / history.length) * 100) + "%"
                  : "—"}
              </b>
            </div>
          </div>
          <div className="workspace-stat">
            <span>{t("可用工具", "Available tools")}</span>
            <strong>{actions.length}</strong>
          </div>
          <div className="workspace-stat">
            <span>{t("计算方式", "Processing")}</span>
            <strong>{t("本地运行", "On device")}</strong>
          </div>
          <div className="workspace-stat">
            <span>{t("内容上传", "Content uploads")}</span>
            <strong>{t("无", "None")}</strong>
          </div>
        </section>
        <section className="glass-panel workflow-promo">
          <span className="promo-icon">⌥</span>
          <h3>{t("一个流程，完成更多", "A little flow goes a long way")}</h3>
          <p>
            {t(
              "将多个工具串联，让重复操作更轻松。",
              "Connect tools and simplify repeated work.",
            )}
          </p>
          <button onClick={() => navigate("workflow")}>
            {t("创建工作流", "Open workflows")} →
          </button>
        </section>
      </aside>
    </div>
  );
}
