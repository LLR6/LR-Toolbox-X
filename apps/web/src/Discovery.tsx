import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { studioMatches, studioShortcut, type StudioId } from "./studios.ts";
import { ToolIcon, UiIcon } from "./Icons.tsx";
import type { Action } from "../../../packages/registry/src/types.ts";
import type { Run } from "./storage.ts";
import "./discovery.css";

export function StudioCards({
  en,
  open,
  query = "",
}: {
  en: boolean;
  open: (id: StudioId) => void;
  query?: string;
}) {
  return (
    <div className="studio-cards">
      {studioMatches(query).map((s, i) => (
        <button
          className={"studio-card accent-" + s.accent}
          data-testid={"studio-" + s.id}
          key={s.id}
          onClick={() => open(s.id)}
        >
          <div className="studio-card-top">
            <ToolIcon category={s.category} />
            <span>{String(i + 1).padStart(2, "0")} / STUDIO</span>
            <UiIcon name="arrow" />
          </div>
          <h3>{en ? s.en : s.name}</h3>
          <p>{en ? s.introEn : s.intro}</p>
          <div className="studio-card-use">{en ? s.useEn : s.use}</div>
          <footer>
            <span>{s.engine}</span>
            <b>{en ? "Open workspace" : "打开工作台"} ↗</b>
          </footer>
        </button>
      ))}
    </div>
  );
}

function ToolBadge({ category }: { category: string }) {
  return <ToolIcon category={category} className="app-badge" />;
}

export function Discovery({
  actions,
  history,
  favorites,
  en,
  choose,
  navigate,
  query,
  setQuery,
  toggle,
  openStudio,
}: {
  actions: Action[];
  history: Run[];
  favorites: string[];
  en: boolean;
  choose: (a: Action) => void;
  navigate: (page: string, category?: string) => void;
  query: string;
  setQuery: (q: string) => void;
  toggle: (id: string) => void;
  openStudio: (id: StudioId) => void;
}) {
  const t = (zh: string, english: string) => (en ? english : zh);
  const [scene, setScene] = useState("everyday");
  const pick = (id: string) => {
    const action = actions.find((a) => a.id === id);
    if (action) choose(action);
  };
  const fuse = useMemo(
    () =>
      new Fuse(actions, {
        threshold: 0.3,
        ignoreLocation: true,
        useExtendedSearch: false,
        keys: [
          { name: "name", weight: 2.4 },
          { name: "nameEn", weight: 2.1 },
          { name: "id", weight: 1.8 },
          { name: "tags", weight: 1.4 },
          { name: "description", weight: 1 },
          { name: "category", weight: 0.8 },
        ],
      }),
    [actions],
  );
  const firstMatch = query.trim()
    ? (fuse.search(query.trim(), { limit: 1 })[0]?.item ??
      actions.find((a) =>
        [a.id, a.name, a.nameEn, a.description, a.category, ...a.tags]
          .join(" ")
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ))
    : undefined;
  const openSearch = () => {
    const studio = studioShortcut(query);
    if (studio) openStudio(studio.id);
    else if (firstMatch) choose(firstMatch);
    else navigate("tools");
  };
  const popular = [
    "json.format",
    "json.repair",
    "html.to.markdown",
    "encoding.base64.encode",
    "hash.sha256",
    "time.timestamp.iso",
    "text.stats",
    "developer.uuid.v4",
    "csv.to.json",
    "network.ipv4.inspect",
    "code.format.javascript",
    "xml.inspect",
    "text.diff",
    "markdown.render",
    "yaml.to.json",
    "qr.generate",
    "archive.zip.create",
    "csv.sort",
    "csv.aggregate",
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
    },
    {
      id: "JSON",
      name: "数据与 JSON",
      en: "Data & JSON",
      desc: "结构清晰，转换自如",
    },
    {
      id: "Encoding",
      name: "编码与解码",
      en: "Encoding",
      desc: "让信息自由转换",
    },
    {
      id: "Developer",
      name: "开发者工具",
      en: "Developer",
      desc: "专注创造，高效开发",
    },
    {
      id: "Math",
      name: "计算与换算",
      en: "Math & numbers",
      desc: "从日常到精确计算",
    },
    {
      id: "workflow",
      name: "自动化工作流",
      en: "Workflows",
      desc: "串联操作，一次完成",
    },
  ];
  const suggestions =
    scene === "study"
      ? ["markdown.render", "csv.aggregate", "text.stats"]
      : scene === "developer"
        ? ["json.format", "code.format.javascript", "text.diff"]
        : ["qr.generate", "archive.zip.create", "csv.sort"];
  const selected = actions.filter((a) => suggestions.includes(a.id));
  const success = history.filter((h) => h.status === "success").length;

  return (
    <div className={"dashboard-layout" + (query ? " searching" : "")}>
      <div className="dashboard-main">
        <section className="task-welcome">
          <div>
            <span>从目标开始 / TASK DESK</span>
            <h2>不知道用哪个工具？把任务交给工作台。</h2>
            <p>描述需求、检查方案、逐步执行。也可以继续浏览全部工具。</p>
          </div>
          <button onClick={() => navigate("assistant")}>打开任务助手 →</button>
        </section>
        <section className="scenic-hero">
          <div className="hero-caption">
            <span className="hero-overline">YOUR IDEAS. IN MOTION.</span>
            <h1>
              {t("让一切更高效", "Make every day flow.")}
              <span> ✦</span>
            </h1>
            <p>
              {t(
                "从一份文件到一个灵感，让每个任务都有清晰的起点。",
                "From a document to an idea. A clear starting point for every task.",
              )}
            </p>
          </div>
          <blockquote className="hero-quote">
            {t("少些寻找，", "Less searching,")}
            <br />
            {t("多些创造。", "more creating.")}
            <br />
            {t("属于你的效率空间。", "A workspace that feels like yours.")}
          </blockquote>
          <div className="hero-search">
            <UiIcon name="search" />
            <input
              aria-label={t("搜索工具", "Search tools")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  openSearch();
                }
              }}
              placeholder={t(
                `搜索 ${actions.length} 个工具，支持错别字和近似关键词…`,
                `Search ${actions.length} tools with typo-tolerant matching…`,
              )}
            />
            <kbd>CTRL K</kbd>
            <button
              aria-label={t("浏览工具", "Browse tools")}
              onClick={openSearch}
            >
              <UiIcon name="arrow" />
            </button>
          </div>
          <div className="hero-chips">
            <span>{t("快速开始", "Quick start")}</span>
            {["json.format", "encoding.base64.encode", "hash.sha256"].map(
              (id) => {
                const action = actions.find((a) => a.id === id);
                return (
                  action && (
                    <button key={id} onClick={() => choose(action)}>
                      {en ? action.nameEn : action.name} ↗
                    </button>
                  )
                );
              },
            )}
            <button onClick={() => openStudio("pdf")}>PDF ↗</button>
            <button onClick={() => openStudio("ocr")}>OCR ↗</button>
          </div>
        </section>

        <section
          className="task-start-section"
          aria-label={t("任务起点", "Start with a task")}
        >
          <div className="dashboard-section-head">
            <div>
              <span className="studio-kicker">START SOMETHING GOOD</span>
              <h2>{t("今天，想完成什么？", "What will you create today?")}</h2>
            </div>
            <span className="section-hint">
              {t("四个入口，少走几步", "Four shortcuts to your next idea")}
            </span>
          </div>
          <div className="task-start-grid">
            {(
              [
                [
                  "pdf",
                  "PDF",
                  "DOCUMENTS",
                  "整理一份文档",
                  "Organize a document",
                  "合并、提取与排版，把零散资料整理好。",
                  "Merge, extract and tidy your pages.",
                  "rose",
                ],
                [
                  "ocr",
                  "OCR",
                  "IMAGES",
                  "读懂一张图片",
                  "Read an image",
                  "识别截图中的文字，让信息再次可编辑。",
                  "Turn a screenshot into editable text.",
                  "sky",
                ],
                [
                  "cyberchef",
                  "Code",
                  "OPEN SOURCE",
                  "探索数据的可能",
                  "Explore your data",
                  "进入开源实验室，把多个操作串成配方。",
                  "Combine operations in an open-source lab.",
                  "violet",
                ],
                [
                  "resources",
                  "System",
                  "YOUR RESOURCES",
                  "管理你的资源",
                  "Know your resources",
                  "查找设备资料、校验原包，发现好用项目。",
                  "Find device packs and open-source projects.",
                  "mint",
                ],
              ] as const
            ).map(
              ([id, category, label, zh, english, desc, descEn, tone], i) => (
                <button
                  key={id}
                  className={"task-start-card task-tone-" + tone}
                  data-testid={"spotlight-" + id}
                  onClick={() => openStudio(id)}
                >
                  <span className="task-card-top">
                    <ToolIcon category={category} />
                    <span>{String(i + 1).padStart(2, "0")}</span>
                  </span>
                  <small>{label}</small>
                  <h3>{t(zh, english)}</h3>
                  <p>{t(desc, descEn)}</p>
                  <b>
                    {t("进入工作台", "Open workspace")} <UiIcon name="arrow" />
                  </b>
                </button>
              ),
            )}
          </div>
        </section>

        <details className="new-tools-shelf glass-panel">
          <summary>
            {t("本次上新 · 6 个数据整理工具", "New · Six data cleanup tools")}{" "}
            <span>{t("展开查看用途与入口", "Explore this collection")}</span>
          </summary>
          <div className="essentials-grid">
            {[
              "text.lists.compare",
              "text.lines.frequency",
              "text.invisible.inspect",
              "text.chunk",
              "url.tracking.clean",
              "json.merge.patch",
            ].map((id) => {
              const action = actions.find((a) => a.id === id);
              return (
                action && (
                  <button
                    className="new-tool-card"
                    key={id}
                    onClick={() => choose(action)}
                  >
                    <ToolBadge category={action.category} />
                    <strong>{en ? action.nameEn : action.name}</strong>
                    <p>{action.description}</p>
                    <b>{t("打开工作台", "Open workspace")} →</b>
                  </button>
                )
              );
            })}
          </div>
        </details>

        <div className="dashboard-section-head">
          <h2>
            <UiIcon name="tools" />
            {t("探索工具分类", "Explore collections")}
          </h2>
          <button onClick={() => navigate("tools")}>
            {t(
              `直接看全部 ${actions.length} 个工具`,
              `Browse all ${actions.length} tools`,
            )}{" "}
            →
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
              <ToolIcon category={c.id} className="collection-icon" />
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
                  : `${actions.filter((a) => a.category === c.id).length} ${t("个工具", "tools")}`}
              </span>
            </button>
          ))}
        </div>

        <div className="activity-grid">
          <section className="glass-panel">
            <div className="dashboard-section-head">
              <h2>
                <UiIcon name="history" />
                {t("最近使用", "Recently used")}
              </h2>
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
                    <UiIcon name="external" className="subtle-arrow" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="welcome-state">
                <ToolIcon category="Time" className="welcome-orbit" />
                <div>
                  <strong>
                    {t(
                      "从一次小小的尝试开始",
                      "Your next great shortcut starts here",
                    )}
                  </strong>
                  <p>
                    {t(
                      "运行工具后，这里会保留快捷入口。",
                      "Recently used tools will appear here.",
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
              <h2>
                <UiIcon name="workflow" />
                {t("执行记录", "Activity")}
              </h2>
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

        <section className="scenario-section dashboard-scenario">
          <div className="dashboard-section-head scenario-heading">
            <div>
              <span className="studio-kicker">A LITTLE DIRECTION</span>
              <h2>
                {t(
                  "按场景给你三项建议",
                  "Three suggestions for the task at hand",
                )}
              </h2>
              <p>
                {t(
                  "推荐不会替代工具库，只是少走两步。",
                  "Recommendations never replace the library; they just save a couple of clicks.",
                )}
              </p>
            </div>
          </div>
          <div
            className="scenario-tabs"
            role="group"
            aria-label={t("使用场景", "Use case")}
          >
            {[
              ["everyday", "日常整理", "Everyday"],
              ["study", "学习与报告", "Study & reports"],
              ["developer", "编程与开发", "Development"],
            ].map(([id, zh, english]) => (
              <button
                aria-pressed={scene === id}
                key={id}
                onClick={() => setScene(id)}
              >
                {t(zh, english)}
              </button>
            ))}
          </div>
          <div className="recommended-tools">
            {selected.map((a) => (
              <article key={a.id}>
                <button
                  data-testid={"dashboard-" + a.id}
                  onClick={() => choose(a)}
                >
                  <ToolIcon category={a.category} />
                  <h3>{en ? a.nameEn : a.name}</h3>
                  <p>{a.description}</p>
                  <b>{t("使用工具", "Open tool")} →</b>
                </button>
                <button
                  className="recommend-favorite"
                  aria-label={
                    (favorites.includes(a.id) ? "Unfavorite " : "Favorite ") +
                    a.id
                  }
                  aria-pressed={favorites.includes(a.id)}
                  onClick={() => toggle(a.id)}
                >
                  ☆
                </button>
              </article>
            ))}
          </div>
        </section>

        <div className="dashboard-section-head">
          <h2>
            <UiIcon name="tools" />
            {t("精选实用工具", "Everyday essentials")}
            <span className="section-hint">
              {t("八项常用，随手打开", "Eight essentials, one click away")}
            </span>
          </h2>
          <button onClick={() => navigate("favorites")}>
            <UiIcon name="favorites" /> {t("我的收藏", "Favorites")}{" "}
            {favorites.length}
          </button>
        </div>
        <div className="essentials-grid">
          {popular.slice(0, 8).map((a) => (
            <article className="essential-card" key={a.id}>
              <button
                className="essential-tool"
                data-testid={"dashboard-" + a.id}
                onClick={() => choose(a)}
              >
                <ToolBadge category={a.category} />
                <span>
                  <strong>{en ? a.nameEn : a.name}</strong>
                  <small>{en ? a.id : a.description}</small>
                </span>
                <UiIcon name="external" className="subtle-arrow" />
              </button>
              <button
                className={
                  "pin-tool" + (favorites.includes(a.id) ? " pinned" : "")
                }
                aria-label={`${favorites.includes(a.id) ? "Unfavorite" : "Favorite"} ${a.id}`}
                title={t("收藏工具", "Favorite tool")}
                aria-pressed={favorites.includes(a.id)}
                onClick={() => toggle(a.id)}
              >
                <UiIcon name="favorites" />
              </button>
            </article>
          ))}
        </div>

        <section className="studio-shelf glass-panel">
          <div className="dashboard-section-head">
            <div>
              <span className="studio-kicker">SPECIALIZED WORKSPACES</span>
              <h2>
                {t(
                  "需要文件处理时，再进入特色工作台",
                  "Specialized workspaces when a simple tool is not enough",
                )}
              </h2>
            </div>
            <button onClick={() => navigate("studios")}>
              {t("单独浏览工作台", "Browse studios")} →
            </button>
          </div>
          <StudioCards en={en} open={openStudio} />
        </section>

        <section className="discover-banner">
          <ToolIcon category="workflow" className="banner-symbol" />
          <div>
            <strong>
              {t(
                "所有工具都应该容易找到",
                "Every tool should stay easy to reach",
              )}
            </strong>
            <p>
              {t(
                `${actions.length} 个本地工具 · 左侧分类常驻 · 推荐只是辅助`,
                `${actions.length} local tools · categories stay visible · recommendations are optional`,
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
            <h2>
              <UiIcon name="tools" />
              {t("快捷工具", "Quick access")}
            </h2>
            <UiIcon name="command" />
          </div>
          <div className="quick-grid">
            {popular.slice(0, 9).map((a) => (
              <button key={a.id} onClick={() => choose(a)}>
                <ToolBadge category={a.category} />
                <span>{en ? a.nameEn : a.name}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="glass-panel studio-mini-panel">
          <div className="dashboard-section-head">
            <h2>
              <UiIcon name="tools" />
              {t("文件工作台", "File studios")}
            </h2>
            <button onClick={() => navigate("studios")}>
              {t("全部", "All")} →
            </button>
          </div>
          <div className="studio-mini-list">
            {(["pdf", "compress", "ocr", "media"] as StudioId[]).map((id) => {
              const studio = studioMatches("").find((s) => s.id === id)!;
              return (
                <button key={id} onClick={() => openStudio(id)}>
                  <ToolIcon category={studio.category} />
                  <span>
                    <strong>{en ? studio.en : studio.name}</strong>
                    <small>{studio.engine}</small>
                  </span>
                  <UiIcon name="external" />
                </button>
              );
            })}
          </div>
        </section>
        <section className="glass-panel usage-panel">
          <div className="dashboard-section-head">
            <h2>
              <UiIcon name="shield" />
              {t("我的工作空间", "Your workspace")}
            </h2>
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
                  ? `${Math.round((success / history.length) * 100)}%`
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
          <ToolIcon category="workflow" className="promo-icon" />
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
