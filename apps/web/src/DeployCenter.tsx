import { download } from "./storage.ts";
import { useState } from "react";
type Tool = { id: string; state: string; detail: string; log: string };
export function DeployCenter() {
  const local = location.hostname === "127.0.0.1";
  const [tools, setTools] = useState<Tool[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function refresh() {
    setBusy(true);
    try {
      const r = await fetch("/api/local/tools");
      if (!r.ok) throw Error("本地服务不可用，请使用新版部署包启动");
      setTools(await r.json());
      setError("");
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  async function install(id: string) {
    setBusy(true);
    try {
      const r = await fetch("/api/local/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!r.ok) throw Error("任务未启动，可能已有安装进行中");
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  const [code, setCode] = useState(""),
    [result, setResult] = useState("");
  async function run(payload: object) {
    setBusy(true);
    setError("");
    setResult("");
    try {
      const r = await fetch("/api/local/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(100000),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error || "执行失败");
      setResult(data.text || data.csv || "无数据");
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="task-desk">
      <div className="task-heading">
        <span>LR / LOCAL DEPLOYMENT</span>
        <h1>本地部署中心</h1>
        <p>在独立 Python 环境安装工具，检测实际状态并查看日志。</p>
      </div>
      <div className="task-card">
        <p>
          第一批支持
          AKShare、MarkItDown、Docling。安装后仍需文件/数据执行适配；本页不会将“已安装”标为“已接入
          Agent”。
        </p>
        {!local ? (
          <>
            <p>请下载新版部署包，在本机启动后打开此页面。</p>
            <a href="./downloads/lr-local-agent.zip" download>
              下载本地部署包
            </a>
          </>
        ) : (
          <button disabled={busy} onClick={refresh}>
            检测 / 刷新状态
          </button>
        )}
        <p>
          依赖来自 Python 包仓库，下载需要网络；Docling
          的模型由其后续功能按需准备。安装可能持续数分钟，可手动刷新查看进度。
        </p>
        {error && <p role="alert">{error}</p>}
        {local && (
          <>
            <h2>本地执行工作台</h2>
            <p>
              先安装 MarkItDown 或
              AKShare，再使用下面的操作。原始文件留在本机；基金查询需要连接外部数据源。
            </p>
            <label>
              MarkItDown 文本文件转换（最大 2 MB）
              <input
                type="file"
                accept=".txt,.md,.html,.htm,.csv,.json"
                disabled={busy}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 2 * 1024 * 1024) {
                    setError("文件最大 2 MB");
                    return;
                  }
                  const bytes = new Uint8Array(await f.arrayBuffer());
                  let binary = "";
                  for (const b of bytes) binary += String.fromCharCode(b);
                  void run({
                    operation: "markitdown",
                    name: f.name,
                    data: btoa(binary),
                  });
                  e.target.value = "";
                }}
              />
            </label>
            <label>
              公募基金代码
              <input
                value={code}
                maxLength={6}
                onChange={(e) => setCode(e.target.value)}
                placeholder="六位基金代码"
              />
            </label>
            <button
              disabled={busy || !/^\d{6}$/.test(code)}
              onClick={() => run({ operation: "fund", code })}
            >
              查询单位净值历史
            </button>
            <p>
              查询最多返回最近 2000
              行，不是实时行情。以数据内日期为准；数据源异常会显示错误。
            </p>
            {result && (
              <>
                <pre>{result}</pre>
                <button
                  onClick={() =>
                    download("local-tool-result.txt", result, "text/plain")
                  }
                >
                  下载结果
                </button>
              </>
            )}
          </>
        )}
        {tools.map((t) => (
          <article key={t.id}>
            <h2>{t.id}</h2>
            <p>
              {t.state} · {t.detail}
            </p>
            <button
              disabled={busy || t.state === "installing"}
              onClick={() => install(t.id)}
            >
              {t.state === "installed" ? "检查更新 / 重新安装" : "安装 / 重试"}
            </button>
            <details>
              <summary>安装日志</summary>
              <pre>{t.log || "暂无日志"}</pre>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}
