import { useState } from "react";
import { studioMatches, type StudioId } from "./studios.ts";
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
  const first = actions.find((a) =>
    [a.id, a.name, a.nameEn, ...a.tags]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const candidates = studioMatches(query);
  const suggestions =
    scene === "study"
      ? ["markdown.render", "csv.aggregate", "text.stats"]
      : scene === "developer"
        ? ["json.format", "code.format.javascript", "text.diff"]
        : ["qr.generate", "archive.zip.create", "csv.sort"];
  const selected = actions.filter((a) => suggestions.includes(a.id));
  const recent = [...new Set(history.map((h) => h.id))]
    .map((id) => actions.find((a) => a.id === id))
    .filter((a): a is Action => !!a)
    .slice(0, 3);
  return (
    <div className="discovery">
      <section className="discovery-hero">
        <div className="discovery-hero-text">
          <span className="studio-kicker">
            LR TOOLBOX X / MAKE ROOM TO CREATE
          </span>
          <h1>
            {t("让一切更高效", "Make every day flow.")}
            <span> ✦</span>
          </h1>
          <p>
            {t(
              "不必认识每一个工具。先说说，你今天想完成什么？",
              "You don’t need to know every tool. Start with what you want to do.",
            )}
          </p>
          <div className="discovery-search">
            <UiIcon name="search" />
            <input
              aria-label={t("搜索工具", "Search tools")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  e.preventDefault();
                  if (candidates[0]) openStudio(candidates[0].id);
                  else if (first) choose(first);
                }
              }}
              placeholder={t(
                "试试：压缩图片、PDF、截图转文字…",
                "Try: PDF, compress images, OCR…",
              )}
            />
            <button
              aria-label={t("浏览工具", "Browse tools")}
              onClick={() => {
                if (query.trim() && candidates[0]) openStudio(candidates[0].id);
                else if (query.trim() && first) choose(first);
                else navigate("tools");
              }}
            >
              →
            </button>
          </div>
          <div className="discovery-chips">
            <span>{t("从这里开始", "Start here")}</span>
            <button onClick={() => openStudio("pdf")}>
              {t("整理一份 PDF", "Organize a PDF")}
            </button>
            <button onClick={() => openStudio("compress")}>
              {t("让图片小一点", "Shrink an image")}
            </button>
            <button onClick={() => openStudio("ocr")}>
              {t("提取截图文字", "Read a screenshot")}
            </button>
          </div>
        </div>
        <div className="hero-art-stack" aria-hidden="true">
          <div className="hero-art-sheet sheet-back">
            PDF <span>01 — 08</span>
          </div>
          <div className="hero-art-sheet sheet-front">
            <ToolIcon category="Files" />
            <span>
              YOUR NEXT
              <br />
              GREAT IDEA.
            </span>
            <div className="hero-art-wave" />
          </div>
          <div className="hero-art-seal">
            LOCAL
            <br />
            FIRST ✦
          </div>
        </div>
      </section>
      {query ? (
        <section className="discovery-section">
          <h2>{t("匹配的创作工作台", "Matching studios")}</h2>
          <StudioCards en={en} open={openStudio} query={query} />
        </section>
      ) : (
        <>
          <section className="discovery-section">
            <div className="discovery-section-head">
              <div>
                <span className="studio-kicker">CURATED FOR YOUR EVERYDAY</span>
                <h2>
                  {t(
                    "七个工作台，解决七类日常事",
                    "Seven studios. Everyday possibilities.",
                  )}
                </h2>
                <p>
                  {t(
                    "每个入口都告诉你能做什么。选择素材，调整选项，再带走结果。",
                    "Know what each tool does. Bring your files, make an adjustment, take the result.",
                  )}
                </p>
              </div>
              <button onClick={() => navigate("tools")}>
                {t("完整工具库", "Full tool library")} →
              </button>
            </div>
            <StudioCards en={en} open={openStudio} />
          </section>
          <section className="scenario-section">
            <div>
              <span className="studio-kicker">A LITTLE DIRECTION</span>
              <h2>{t("还不知道选哪个？", "Not sure where to start?")}</h2>
              <p>
                {t(
                  "按你正在做的事情，推荐三个顺手工具。",
                  "Three useful tools for what you are doing.",
                )}
              </p>
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
          {!!recent.length && (
            <section className="discovery-section">
              <div className="discovery-section-head">
                <h2>{t("接着上次继续", "Pick up where you left off")}</h2>
                <button onClick={() => navigate("history")}>
                  {t("执行历史", "History")} →
                </button>
              </div>
              <div className="discovery-recent">
                {recent.map((a) => (
                  <button key={a.id} onClick={() => choose(a)}>
                    <ToolIcon category={a.category} />
                    {en ? a.nameEn : a.name} ↗
                  </button>
                ))}
              </div>
            </section>
          )}
          <section className="discovery-about">
            <div>
              <span className="studio-kicker">YOUR FILES. YOUR SPACE.</span>
              <h2>
                {t(
                  "小事交给工具，创意留给自己。",
                  "Less friction. More room for you.",
                )}
              </h2>
              <p>
                {t(
                  "文件在本机处理，历史只记名称和耗时。需要更多专业工具时，再打开完整工具库。",
                  "Files are processed locally. History keeps tool names and timing, not file contents. The full library is here when you need it.",
                )}
              </p>
            </div>
            <button onClick={() => navigate("tools")}>
              {t(
                `浏览 ${actions.length} 个基础工具`,
                `Explore ${actions.length} core tools`,
              )}{" "}
              →
            </button>
          </section>
        </>
      )}
    </div>
  );
}
