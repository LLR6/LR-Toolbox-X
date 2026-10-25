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
