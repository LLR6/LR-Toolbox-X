import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import packs from "./resource-packs.json";
import { openSourcePicks } from "./open-source-picks.ts";
import { inspectCalendar, readPackDocument } from "./resource-tools.ts";
import { studios, type ResearchStudioId } from "./studios.ts";
import { ToolIcon } from "./Icons.tsx";
import { download } from "./storage.ts";
import "./research-workspace.css";

const EXAMPLE =
  "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//LR Toolbox X//Calendar//ZH\r\nBEGIN:VEVENT\r\nUID:demo@lr\r\nDTSTART:20261024T010000Z\r\nDTEND:20261024T030000Z\r\nSUMMARY:专注学习\r\nLOCATION:图书馆\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n";
type CalendarRows = Awaited<ReturnType<typeof inspectCalendar>>;
export function ResearchWorkspace({
  id,
  en,
  onClose,
  onRecord,
  onOpen,
}: {
  id: ResearchStudioId;
  en: boolean;
  onClose: () => void;
  onRecord: (id: string, status: "success" | "error", ms: number) => void;
  onOpen: (id: ResearchStudioId) => void;
}) {
  const meta = studios.find((x) => x.id === id)!;
  const [active, setActive] = useState("poc");
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("上传资源");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [archive, setArchive] = useState<Uint8Array | null>(null);
  const [doc, setDoc] = useState("");
  const [docName, setDocName] = useState("");
  const [source, setSource] = useState(EXAMPLE);
  const [events, setEvents] = useState<CalendarRows>([]);
  const [qr, setQr] = useState("");
  const pack = packs.find((x) => x.id === active)!;
  const fileSearch = useMemo(
    () =>
      new Fuse<{ path: string; size: number | null }>(pack.files, {
        keys: ["path"],
        threshold: 0.32,
        ignoreLocation: true,
      }),
    [pack],
  );
  const entries = query.trim()
    ? fileSearch.search(query, { limit: 100 }).map((x) => x.item)
    : pack.files.slice(0, 100);
  const picks = openSourcePicks.filter(
    (x) =>
      (scope === "开源推荐" || scope === x.tag) &&
      (!query ||
        `${x.name} ${x.intro} ${x.tag}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  async function task(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    const start = performance.now();
    try {
      await fn();
      onRecord(`studio.${id}`, "success", performance.now() - start);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      onRecord(`studio.${id}`, "error", performance.now() - start);
    } finally {
      setBusy(false);
    }
  }
  async function verify(file: File) {
    await task(async () => {
      if (file.size > 300_000_000) throw Error("资源包最大 300 MB");
      setArchive(null);
      setDoc("");
      setDocName("");
      if (file.size !== pack.bytes)
        throw Error("文件大小与登记包不同，请选择对应的原始包");
      const data = await file.arrayBuffer();
      const hash = Array.from(
        new Uint8Array(await crypto.subtle.digest("SHA-256", data)),
        (v) => v.toString(16).padStart(2, "0"),
      ).join("");
      if (hash !== pack.sha256)
        throw Error("SHA-256 不一致：这不是登记的同一份包");
      if (file.size <= 12_000_000 && file.name.toLowerCase().endsWith(".zip"))
        setArchive(new Uint8Array(data));
      setNotice("完整性一致 · 与上传原包相同（不代表来源可信或设备兼容）");
    });
  }
  async function readQr(file: File) {
    await task(async () => {
      setQr("");
      if (file.size > 10_000_000) throw Error("图片最大 10 MB");
      const image = await createImageBitmap(file);
      try {
        if (image.width * image.height > 16_000_000)
          throw Error("图片最大 1600 万像素");
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw Error("Canvas unavailable");
        ctx.drawImage(image, 0, 0);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { default: jsQR } = await import("jsqr");
        const result = jsQR(pixels.data, canvas.width, canvas.height, {
          inversionAttempts: "attemptBoth",
        });
        if (!result)
          throw Error("未找到可读二维码，请选择更清晰、包含完整边缘的图片");
        setQr(result.data);
        setNotice("已在本机识别 · 不会自动打开链接");
      } finally {
        image.close();
      }
    });
  }
  return (
    <section className="research-workspace" aria-label={meta.en}>
      <button className="research-back" onClick={onClose} disabled={busy}>
        ← {en ? "Back" : "返回工作台"}
      </button>
      <header className="research-hero">
        <ToolIcon category={meta.category} />
        <div>
          <span>LR / OPEN LAB</span>
          <h1>{en ? meta.en : meta.name}</h1>
          <p>{en ? meta.introEn : meta.intro}</p>
        </div>
        <b>LOCAL FIRST</b>
      </header>
      {id === "resources" && (
        <>
          <nav className="research-tabs" aria-label="资源分类">
            {[
              "上传资源",
              "开源推荐",
              "已接入",
              "文档与 AI",
              "视觉表达",
              "日常效率",
              "开发与数据",
            ].map((x) => (
              <button
                key={x}
                aria-pressed={scope === x}
                onClick={() => {
                  setScope(x);
                  setQuery("");
                }}
              >
                {x}
              </button>
            ))}
          </nav>
          <label className="research-search">
            查找资源
            <input
              aria-label="查找资源"
              placeholder={
                scope === "上传资源"
                  ? "产品、文件名、CVE…"
                  : "项目、用途、关键词…"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          {scope === "上传资源" ? (
            <>
              <div className="research-pack-grid">
                {packs.map((p) => (
                  <button
                    key={p.id}
                    data-testid={`pack-${p.id}`}
                    aria-pressed={active === p.id}
                    disabled={busy}
                    onClick={() => {
                      setActive(p.id);
                      setQuery("");
                      setArchive(null);
                      setDoc("");
                      setDocName("");
                      setNotice("");
                      setError("");
                    }}
                  >
                    <ToolIcon
                      category={
                        p.id === "poc"
                          ? "Code"
                          : p.id === "sqlmap"
                            ? "Developer"
                            : "System"
                      }
                    />
                    <span>{p.mode}</span>
                    <h2>{p.title}</h2>
                    <p>
                      {p.files.length} 个文件 · {(p.bytes / 1048576).toFixed(1)}{" "}
                      MB
                    </p>
                  </button>
                ))}
              </div>
              <div className="research-panel">
                <span>YOUR RESOURCE / {pack.id.toUpperCase()}</span>
                <h2>{pack.title}</h2>
                <p>{pack.intro}</p>
                <p className="research-filename">{pack.filename}</p>
                <details>
                  <summary>查看原包指纹 SHA-256</summary>
                  <code>{pack.sha256}</code>
                </details>
                <label className="research-file">
                  选择本机原包，核对完整性
                  {pack.id === "poc" || pack.id === "sqlmap"
                    ? "并读取文本"
                    : ""}
                  <input
                    aria-label="本机资源包"
                    type="file"
                    accept={pack.id === "cpe" ? ".rar" : ".zip"}
                    disabled={busy}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void verify(f);
                      e.target.value = "";
                    }}
                  />
                </label>
                {pack.repo && (
                  <p>
                    <a href={pack.repo} target="_blank" rel="noreferrer">
                      官方 sqlmap 仓库 ↗
                    </a>{" "}
                    ·{" "}
                    <a
                      href="https://github.com/sqlmapproject/sqlmap/wiki/Usage"
                      target="_blank"
                      rel="noreferrer"
                    >
                      使用手册 ↗
                    </a>
                  </p>
                )}
                {pack.id === "sqlmap" && (
                  <p>
                    在本机源码目录查看帮助：<code>python sqlmap.py -h</code>
                    。本页面不启动 Python，不连接检测目标。
                  </p>
                )}
                <button
                  onClick={() =>
                    download(
                      `${pack.id}-manifest.json`,
                      JSON.stringify(pack, null, 2),
                      "application/json",
                    )
                  }
                >
                  下载资源清单 JSON ↓
                </button>
              </div>
              <div className="research-columns">
                <div className="research-panel">
                  <h2>文件索引</h2>
                  <p>
                    共 {pack.files.length} 个文件；
                    {query ? "显示最相关的" : "预览前"} {entries.length}{" "}
                    项。清单不包含文件正文。
                  </p>
                  <div className="research-file-list">
                    {entries.map((f) => (
                      <button
                        key={f.path}
                        disabled={
                          !archive ||
                          !/\.(md|txt|py|json|ini|xml)$/i.test(f.path) ||
                          busy
                        }
                        onClick={() => {
                          void task(async () => {
                            setDoc("");
                            setDocName("");
                            const text = readPackDocument(archive!, f.path);
                            setDoc(text);
                            setDocName(f.path);
                            setNotice("正文仅读取自本机 ZIP");
                          });
                        }}
                      >
                        {f.path.split("/").slice(1).join("/") || f.path}
                      </button>
                    ))}
                    {entries.length === 0 && <p>没有匹配文件。</p>}
                  </div>
                </div>
                <div className="research-panel">
                  <h2>本地文本阅读</h2>
                  <p>
                    {docName ||
                      "选入并校验原始 ZIP 后，点击文本条目阅读。最多 256 KB / 文件；脚本和 HTML 均按纯文本显示。"}
                  </p>
                  {doc && (
                    <>
                      <button
                        onClick={() => download("resource-note.txt", doc)}
                      >
                        下载当前文本 ↓
                      </button>
                      <pre>{doc}</pre>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="research-picks">
              {picks.map((p) => (
                <article className="research-panel" key={p.name}>
                  <span>
                    {p.tag} / {p.mode}
                  </span>
                  <h2>{p.name}</h2>
                  <p>{p.intro}</p>
                  <p>{p.use}</p>
                  {p.studio && (
                    <button onClick={() => onOpen(p.studio)}>
                      打开已接入工作台 →
                    </button>
                  )}
                  <a
                    href={`https://github.com/${p.repo}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub 项目 ↗
                  </a>
                </article>
              ))}
              {picks.length === 0 && <p>没有匹配项目，试试其他关键词。</p>}
            </div>
          )}
          <p className="research-note">
            外部项目是经过筛选的独立工具，未计入内置工具数量。上传包只登记文件名、大小和指纹；固件、APK
            和第三方源码未随网站分发。
          </p>
        </>
      )}
      {id === "qrread" && (
        <div className="research-columns">
          <div className="research-panel">
            <h2>从图片读取二维码</h2>
            <p>
              支持常见图片，最大 10 MB、1600
              万像素。一次识别一枚二维码，图片内容不上传。
            </p>
            <label className="research-file">
              选择二维码图片
              <input
                aria-label="二维码图片"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/bmp"
                disabled={busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void readQr(f);
                  e.target.value = "";
                }}
              />
            </label>
            <a
              href="https://github.com/cozmo/jsQR"
              target="_blank"
              rel="noreferrer"
            >
              由 jsQR 驱动 ↗
            </a>
          </div>
          <div className="research-panel">
            <h2>识别结果</h2>
            <p>结果按纯文本显示，避免误开二维码中的链接。</p>
            <textarea aria-label="二维码结果" readOnly value={qr} rows={10} />
            <button
              disabled={!qr}
              onClick={() => download("QR-content.txt", qr)}
            >
              下载识别文本 ↓
            </button>
          </div>
        </div>
      )}
      {id === "calendar" && (
        <>
          <div className="research-columns">
            <div className="research-panel">
              <h2>日历源文件 ICS</h2>
              <p>
                最多 500 KB、500 个事件。保留原始时间、TZID
                与重复规则，不展开重复日程或猜测浮动时区。
              </p>
              <label className="research-file">
                选择 ICS 文件
                <input
                  type="file"
                  aria-label="ICS 文件"
                  accept=".ics,text/calendar"
                  disabled={busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f)
                      void task(async () => {
                        if (f.size > 500_000) throw Error("ICS 最大 500 KB");
                        setEvents([]);
                        setSource(await f.text());
                      });
                    e.target.value = "";
                  }}
                />
              </label>
              <textarea
                aria-label="ICS 内容"
                rows={14}
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                  setEvents([]);
                }}
              />
              <button
                disabled={busy}
                onClick={() =>
                  void task(async () => {
                    setEvents([]);
                    const rows = await inspectCalendar(source);
                    setEvents(rows);
                    setNotice(`已解析 ${rows.length} 个事件`);
                  })
                }
              >
                解析日历 →
              </button>
            </div>
            <div className="research-panel">
              <h2>事件概览</h2>
              <strong className="research-count">
                {events.length.toString().padStart(2, "0")}
              </strong>
              <p>真实事件 / VEVENT</p>
              <button
                disabled={!events.length}
                onClick={() =>
                  download(
                    "LR-calendar.json",
                    JSON.stringify(events, null, 2),
                    "application/json",
                  )
                }
              >
                下载事件 JSON ↓
              </button>
              <p>
                <a
                  href="https://github.com/kewisch/ical.js"
                  target="_blank"
                  rel="noreferrer"
                >
                  由 ICAL.js 驱动 ↗
                </a>
              </p>
            </div>
          </div>
          <div className="research-panel research-table">
            <table>
              <thead>
                <tr>
                  <th>事件</th>
                  <th>开始</th>
                  <th>结束</th>
                  <th>时区</th>
                  <th>位置 / 重复规则</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e, i) => (
                  <tr key={i}>
                    <td>{e.title}</td>
                    <td>{e.start}</td>
                    <td>{e.end}</td>
                    <td>{e.zone}</td>
                    <td>
                      {e.location}
                      <br />
                      {e.recurrence}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {busy && <p role="status">正在本机处理…</p>}
      {notice && (
        <p role="status" className="research-notice">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="research-error">
          {error}
        </p>
      )}
    </section>
  );
}
