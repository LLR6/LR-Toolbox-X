import { useEffect, useRef, useState } from "react";
import { download } from "./storage.ts";
const projects = {
  duckdb: {
    name: "数据分析台",
    repo: "duckdb/duckdb-wasm",
    intro: "上传 CSV，用 SQL 筛选、汇总和分析。",
    mode: "浏览器执行 · DuckDB-Wasm 1.29.0",
  },
  czkawka: {
    name: "重复文件整理",
    repo: "qarmin/czkawka",
    intro: "找出重复文件、空目录和相似图片，让资料库恢复清晰。",
    mode: "桌面配套 · 需要独立安装",
  },
  losslesscut: {
    name: "无损音视频剪辑",
    repo: "mifi/lossless-cut",
    intro: "快速剪掉片头片尾、拆分录音和整理视频素材。",
    mode: "桌面配套 · 需要独立安装",
  },
  tabby: {
    name: "AI 编程助手",
    repo: "TabbyML/tabby",
    intro: "为编辑器部署可自托管的 AI 代码助手。",
    mode: "独立服务 · 需要本机部署",
  },
};
export type PowerId = keyof typeof projects;
export function PowerStudios({
  id,
  onClose,
}: {
  id: PowerId;
  onClose: () => void;
}) {
  const p = projects[id];
  return (
    <section className="task-desk">
      <button onClick={onClose}>← 返回工具箱</button>
      <div className="task-heading">
        <span>LR / OPEN SOURCE WORKSPACE</span>
        <h1>{p.name}</h1>
        <p>{p.intro}</p>
        <p>
          {p.mode} ·{" "}
          <a
            href={"https://github.com/" + p.repo}
            target="_blank"
            rel="noreferrer"
          >
            项目源码 ↗
          </a>
        </p>
      </div>
      {id === "duckdb" ? <DataDesk /> : <Companion id={id} />}
    </section>
  );
}
function Companion({ id }: { id: Exclude<PowerId, "duckdb"> }) {
  const p = projects[id];
  const [message, setMessage] = useState("");
  const steps =
    id === "czkawka"
      ? [
          "从官方 Releases 下载适合系统的 Czkawka GUI 或 Krokiet。不同界面许可证不同，请查看发行说明。",
          "选择需要扫描的目录，先排除系统目录与重要备份。",
          "先按内容哈希检查重复文件；相似图片属于另一种匹配方式。",
          "预览并核对结果，再自行选择移动或删除。本站不会读取或删除本机目录。",
        ]
      : id === "losslesscut"
        ? [
            "从官方 Releases 下载对应系统安装包。",
            "拖入视频或录音，标记需要保留的片段。",
            "选择导出片段；无需转码的剪切通常更快。",
            "检查导出文件。精确切点受关键帧与格式限制，部分操作需要重新编码。",
          ]
        : [
            "先安装 Docker；GPU 模式另需 NVIDIA Container Toolkit。",
            "从官方文档选择 CPU 或 GPU 启动方式，首次会下载模型。",
            "服务就绪后打开 localhost:8080，按 Tabby 指引配置账号与编辑器扩展。",
            "Tabby 是独立编程助手，尚未接入 LR 任务助手的模型接口；不要把其安装入口理解为已运行的模型。",
          ];
  const command =
    "docker run -it --rm -p 127.0.0.1:8080:8080 -v tabby-data:/data registry.tabbyml.com/tabbyml/tabby serve --model StarCoder-1B --device cpu";
  return (
    <div className="task-grid">
      <article className="task-card">
        <b>01 / 使用与部署</b>
        <ol>
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p>这是独立工具配套入口，未在网页中内嵌执行，也未在你的电脑上安装。</p>
        <a
          href={"https://github.com/" + p.repo + "/releases"}
          target="_blank"
          rel="noreferrer"
        >
          官方版本与下载 ↗
        </a>
        {id === "tabby" && (
          <>
            <p>
              CPU 入门启动命令（需预装 Docker，首次联网下载；速度取决于硬件）：
            </p>
            <pre>{command}</pre>
            <button
              onClick={() => {
                download(
                  "start-tabby.sh",
                  "#!/bin/sh\nset -eu\n" + command + "\n",
                  "text/plain",
                );
                setMessage("启动脚本已生成。请在装有 Docker 的本机终端运行。");
              }}
            >
              下载启动脚本
            </button>
            <p>
              <a
                href="https://tabby.tabbyml.com/docs/quick-start/installation/docker/"
                target="_blank"
                rel="noreferrer"
              >
                官方部署文档 ↗
              </a>
            </p>
            <p role="status">{message}</p>
          </>
        )}
      </article>
      <article className="task-card">
        <b>02 / 为什么加入工具箱</b>
        <h2>
          {id === "czkawka"
            ? "整理不断膨胀的文件库"
            : id === "losslesscut"
              ? "更快整理长视频和录音"
              : "让代码编辑器获得本地 AI 能力"}
        </h2>
        <p>
          {id === "czkawka"
            ? "适合照片备份、重复下载的资料和多硬盘归档。先扫描预览，再决定如何处理。"
            : id === "losslesscut"
              ? "适合课程录屏、采访录音、会议素材和长视频拆段。保留原文件，导出后再检查。"
              : "适合希望自己管理编程模型和代码上下文的开发者。它与 Ollama 任务规划器用途不同，需要单独维护。"}
        </p>
        <p>
          许可证、平台兼容性和模型条款以官方项目为准；本站保留上游名称与链接，不重新分发这三个项目的二进制程序。
        </p>
      </article>
    </div>
  );
}
function DataDesk() {
  const [sql, setSql] = useState(
      "SELECT category, SUM(amount) AS total FROM data GROUP BY category ORDER BY total DESC",
    ),
    [csv, setCsv] = useState("category,amount\n学习,20\n生活,35\n学习,15\n"),
    [rows, setRows] = useState<Record<string, unknown>[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [status, setStatus] = useState(
      "CSV 表名固定为 data；首次运行需联网加载引擎。",
    );
  type QueryResult = {toArray:()=>{toJSON:()=>Record<string,unknown>}[]};
  type Database = {registerFileText:(name:string,text:string)=>Promise<void>;connect:()=>Promise<{query:(sql:string)=>Promise<QueryResult>;close:()=>Promise<void>}>};
  const runtime = useRef<Database | null>(null),
    worker = useRef<Worker | null>(null),
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      worker.current?.terminate();
    };
  }, []);
  async function run() {
    setBusy(true);
    setError("");
    setRows([]);
    try {
      if (
        !/^\s*(select|with)\b/i.test(sql) ||
        /;\s*\S/.test(sql) ||
        /\b(install|load|copy|attach|http|read_|pragma|call)\b/i.test(sql)
      )
        throw Error(
          "请使用单条 SELECT / WITH 查询。此工作台用于本地 CSV 分析。",
        );
      if (!runtime.current) {
        setStatus("正在加载 DuckDB 引擎…");
        const source =
          "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/+esm";
        const duck = await import(/* @vite-ignore */ source);
        const bundle = await duck.selectBundle(duck.getJsDelivrBundles());
        const url = URL.createObjectURL(
          new Blob([`importScripts(${JSON.stringify(bundle.mainWorker)});`], {
            type: "text/javascript",
          }),
        );
        const w = new Worker(url);
        worker.current = w;
        const db = new duck.AsyncDuckDB(new duck.ConsoleLogger(), w);
        try {
          await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        } finally {
          URL.revokeObjectURL(url);
        }
        runtime.current = db;
      }
      const db = runtime.current;
      if (!db) throw Error("数据引擎未就绪");
      await db.registerFileText("input.csv", csv);
      const connection = await db.connect();
      try {
        await connection.query(
          "CREATE OR REPLACE TABLE data AS SELECT * FROM read_csv_auto('input.csv', header=true)",
        );
        const result = await connection.query(
          "SELECT * FROM (" + sql.trim().replace(/;$/, "") + ") LIMIT 500",
        );
        const data = result.toArray().map((r) => r.toJSON());
        if (alive.current) {
          setRows(data);
          setStatus(
            "查询完成 · " + data.length + " 行（最多显示和导出 500 行）",
          );
        }
      } finally {
        await connection.close();
      }
    } catch (e) {
      if (alive.current) {
        setError(e instanceof Error ? e.message : "查询失败");
        setStatus("未完成，可修改输入后重试。");
        if (!runtime.current) {
          worker.current?.terminate();
          worker.current = null;
        }
      }
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  const json = JSON.stringify(
    rows,
    (_, v) => (typeof v === "bigint" ? v.toString() : v),
    2,
  );
  const columns = Object.keys(rows[0] || {});
  return (
    <div className="task-grid">
      <article className="task-card">
        <b>01 / 输入与查询</b>
        <p>
          文件在浏览器处理，不上传服务器。引擎从 jsDelivr
          加载，需要网络；这是单线程分析台，不保证超大文件性能。
        </p>
        <label>
          上传 UTF-8 CSV（最大 5 MB）
          <input
            type="file"
            accept=".csv"
            disabled={busy}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                if (f.size > 5 * 1024 * 1024) throw Error("CSV 最大 5 MB");
                const content = new TextDecoder("utf-8", {
                  fatal: true,
                }).decode(await f.arrayBuffer());
                setCsv(content);
                setRows([]);
                setError("");
              } catch (x) {
                setError(x instanceof Error ? x.message : "读取失败");
              }
              e.target.value = "";
            }}
          />
        </label>
        <label>
          CSV 内容
          <textarea
            rows={7}
            value={csv}
            disabled={busy}
            onChange={(e) => {
              setCsv(e.target.value);
              setRows([]);
            }}
          />
        </label>
        <label>
          SQL 查询
          <textarea
            rows={5}
            value={sql}
            disabled={busy}
            onChange={(e) => {
              setSql(e.target.value);
              setRows([]);
            }}
          />
        </label>
        <button disabled={busy} onClick={run}>
          {busy ? "正在分析…" : "运行 SQL →"}
        </button>
        <p role="status">{status}</p>
        {error && <p role="alert">{error}</p>}
      </article>
      <article className="task-card">
        <b>02 / 数据结果</b>
        <div style={{ overflow: "auto", maxHeight: 600 }}>
          <table>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c}>{String(r[c] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!!rows.length && (
          <button
            onClick={() =>
              download("duckdb-result.json", json, "application/json")
            }
          >
            下载 JSON 结果
          </button>
        )}
        <p>
          适合筛选、分组求和、排序与聚合。列名含空格时使用双引号引用。查询引擎尚未自动接入
          Agent 工具流。
        </p>
      </article>
    </div>
  );
}
