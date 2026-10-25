import { useState } from "react";
import {
  actions,
  execute,
  type Action,
} from "../../../packages/registry/src/index.ts";
import { download } from "./storage.ts";
const eligible = actions.filter(
  (a) =>
    a.risk_level === "safe" &&
    !a.permissions.length &&
    Object.keys(a.input_schema.properties || {}).length === 1 &&
    a.input_schema.properties?.text?.type === "string",
);
const recipes = [
  {
    name: "整理重复名单",
    match: /名单|去重|重复|清理|list/i,
    ids: [
      "text.trim",
      "text.lines.nonempty",
      "text.lines.unique",
      "text.lines.sort",
    ],
    sample: "李明\n王华\n李明\n\n张三",
  },
  {
    name: "修复 JSON 并检查",
    match: /json|接口|配置/i,
    ids: ["json.repair", "json.format"],
    sample: "{name:'LR',items:[1,2,],}",
  },
  {
    name: "网页内容转 Markdown",
    match: /html|网页|markdown/i,
    ids: ["html.to.markdown", "text.trim"],
    sample: "<h1>研究笔记</h1><p>从一个问题开始。</p>",
  },
];
export function TaskDesk({ choose }: { choose: (a: Action) => void }) {
  const [goal, setGoal] = useState("整理名单，删除空白行和重复项，再排序");
  const [text, setText] = useState(recipes[0].sample),
    [plan, setPlan] = useState<string[]>([]),
    [results, setResults] = useState<string[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [mode, setMode] = useState("本地模板"),
    [endpoint, setEndpoint] = useState(""),
    [model, setModel] = useState(""),
    [key, setKey] = useState("");
  function clear() {
    setResults([]);
    setError("");
  }
  async function generate() {
    clear();
    setBusy(true);
    try {
      if (!endpoint) {
        const recipe = recipes.find((r) => r.match.test(goal));
        if (!recipe)
          throw Error(
            "本地模板暂不支持这个任务。请选择下方示例，或连接模型生成方案。",
          );
        setPlan(recipe.ids);
        setMode("本地模板");
      } else {
        const url = new URL(endpoint, window.location.origin);
        if (
          url.protocol !== "https:" &&
          !(
            url.origin === window.location.origin &&
            url.hostname === "127.0.0.1"
          )
        )
          throw Error("模型地址需要使用 HTTPS。");
        if (!model.trim()) throw Error("请填写模型名称。");
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(key ? { Authorization: `Bearer ${key}` } : {}),
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content:
                  '你是工具规划器。只输出 JSON {"steps":["工具id"]}，1到8步。只选目录内的工具，每一步接收上一步的文本输出。不能完成任务时输出 {"steps":[]}。目录：' +
                  JSON.stringify(
                    eligible.map((a) => ({ id: a.id, name: a.name })),
                  ),
              },
              { role: "user", content: goal },
            ],
            temperature: 0,
          }),
          signal: AbortSignal.timeout(180000),
        });
        if (!response.ok)
          throw Error(
            "模型请求失败（" +
              response.status +
              "），请检查地址、权限和跨域设置。",
          );
        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content;
        const parsed = JSON.parse(
          String(raw)
            .replace(/<think>[\s\S]*?<\/think>/g, "")
            .trim()
            .replace(/^```(?:json)?\s*|\s*```$/g, ""),
        );
        if (
          !Array.isArray(parsed.steps) ||
          !parsed.steps.length ||
          parsed.steps.length > 8 ||
          parsed.steps.some(
            (id: unknown) =>
              typeof id !== "string" || !eligible.some((a) => a.id === id),
          )
        )
          throw Error(
            "模型未返回可执行方案。请换一种描述；本站不会执行未知工具。",
          );
        setPlan(parsed.steps);
        setMode("AI 生成 · " + model);
      }
    } catch (e) {
      setPlan([]);
      setError(e instanceof Error ? e.message : "规划失败");
    } finally {
      setBusy(false);
    }
  }
  async function next() {
    setBusy(true);
    setError("");
    try {
      const source = results.length ? results.at(-1)! : text;
      const value = await execute(
        plan[results.length],
        { text: source },
        "web",
      );
      setResults([
        ...results,
        typeof value === "string" ? value : JSON.stringify(value, null, 2),
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "执行失败");
    } finally {
      setBusy(false);
    }
  }
  async function importFile(file: File) {
    setError("");
    try {
      if (file.size > 2 * 1024 * 1024) throw Error("文件最大 2 MB。");
      if (!/\.(txt|md|csv|json|html?|xml|ya?ml|log)$/i.test(file.name))
        throw Error(
          "暂支持 TXT、Markdown、CSV、JSON、HTML、XML、YAML、LOG 文本文件。PDF、图片和 Word 请使用文件工作台。",
        );
      const bytes = await file.arrayBuffer();
      const content = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (content.includes("\0"))
        throw Error("检测到二进制内容，请上传 UTF-8 文本文件。");
      setText(content);
      clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : "文件读取失败");
    }
  }
  async function runAll() {
    setBusy(true);
    setError("");
    const completed = [...results];
    try {
      for (let i = completed.length; i < plan.length; i++) {
        const value = await execute(
          plan[i],
          { text: completed.length ? completed.at(-1)! : text },
          "web",
        );
        completed.push(
          typeof value === "string" ? value : JSON.stringify(value, null, 2),
        );
        setResults([...completed]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "执行失败");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="task-desk">
      <div className="task-heading">
        <span>LR / TASK DESK</span>
        <h1>说出目标，从这里开始。</h1>
        <p>先排好工具，再逐步完成。每一步都能检查，出错时保留已完成的结果。</p>
      </div>
      <div className="task-grid">
        <div className="task-card">
          <b>01 / 描述任务</b>
          <label>
            你想完成什么？
            <textarea
              value={goal}
              onChange={(e) => {
                setGoal(e.target.value);
                setPlan([]);
                clear();
              }}
              rows={3}
            />
          </label>
          <div className="task-examples">
            {recipes.map((r) => (
              <button
                key={r.name}
                onClick={() => {
                  setGoal(r.name);
                  setText(r.sample);
                  setPlan(r.ids);
                  setMode("本地模板");
                  clear();
                }}
              >
                {r.name} ↗
              </button>
            ))}
          </div>
          <button
            className="primary"
            disabled={busy || !goal.trim()}
            onClick={generate}
          >
            {busy ? "处理中…" : "生成工具方案 →"}
          </button>
          <details>
            <summary>连接 AI 模型（可选）</summary>
            <p>
              <a href="./downloads/lr-local-agent.zip" download>
                下载本机部署包（Ollama + LR Agent）
              </a>
            </p>
            <p>
              部署包需要 Python 3.10+；Windows 可通过 winget 安装
              Ollama，macOS/Linux 需先安装官方 Ollama。首次运行下载轻量 Qwen3
              1.7B。请从部署包打开本地网页后连接，云端网页不直接访问你的电脑。
            </p>
            <button
              disabled={window.location.hostname !== "127.0.0.1"}
              onClick={() => {
                setEndpoint("/api/local/chat/completions");
                setModel("qwen3:1.7b");
                setKey("");
              }}
            >
              使用本机 Ollama
            </button>
            <p>
              使用兼容 Chat Completions 的 HTTPS
              接口，需要支持浏览器跨域。生成方案只发送任务描述和工具目录，不发送下方原始数据。密钥仅保留在当前页面内存中。
            </p>
            <label>
              完整接口地址
              <input
                type="url"
                placeholder="https://你的服务/v1/chat/completions"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
              />
            </label>
            <label>
              模型名称
              <input value={model} onChange={(e) => setModel(e.target.value)} />
            </label>
            <label>
              API Key
              <input
                type="password"
                autoComplete="off"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
            </label>
            <button
              onClick={() => {
                setKey("");
                setEndpoint("");
                setModel("");
              }}
            >
              断开并清除配置
            </button>
          </details>
          <label>
            上传文本文件（UTF-8，最大 2 MB）
            <input
              type="file"
              accept=".txt,.md,.csv,.json,.html,.htm,.xml,.yaml,.yml,.log"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importFile(file);
                e.target.value = "";
              }}
            />
          </label>
          <p>
            文件只在浏览器读取，作为工具流输入；生成 AI 方案不会发送文件内容。
          </p>
          <label>
            待处理文本
            <textarea
              rows={10}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                clear();
              }}
            />
          </label>
          <small>
            内置工具在本地执行。当前支持文本串联；文件工作台需要单独打开。
          </small>
        </div>
        <div className="task-card">
          <b>02 / 执行工作台</b>
          <p>
            {mode} ·{" "}
            {plan.length
              ? `${results.length} / ${plan.length} 步完成`
              : "等待生成方案"}
          </p>
          {!plan.length && (
            <div className="task-empty">
              选择一个示例，或输入目标并生成方案。
              <br />
              随后逐步执行，结果会出现在这里。
            </div>
          )}
          <ol>
            {plan.map((id, i) => {
              const action = eligible.find((a) => a.id === id)!;
              return (
                <li key={i} className={i < results.length ? "done" : ""}>
                  <strong>
                    {i < results.length ? "✓ " : ""}
                    {action.name}
                  </strong>
                  <p>{action.description}</p>
                  <button disabled={busy} onClick={() => choose(action)}>
                    单独打开
                  </button>
                </li>
              );
            })}
          </ol>
          {!!plan.length && (
            <div className="task-examples">
              <button
                className="primary"
                disabled={busy || results.length === plan.length}
                onClick={next}
              >
                {results.length === plan.length
                  ? "任务已完成"
                  : `执行第 ${results.length + 1} 步 →`}
              </button>
              <button
                className="primary"
                disabled={busy || results.length === plan.length}
                onClick={runAll}
              >
                一键执行全部步骤
              </button>
              <button disabled={busy} onClick={clear}>
                从头运行
              </button>
            </div>
          )}
          {error && (
            <p role="alert" className="task-error">
              {error}
            </p>
          )}
          {results.map((r, i) => (
            <details key={i} open={i === results.length - 1}>
              <summary>第 {i + 1} 步结果</summary>
              <pre>{r}</pre>
            </details>
          ))}
          {!!results.length && (
            <button
              onClick={() =>
                download("LR-task-result.txt", results.at(-1)!, "text/plain")
              }
            >
              下载当前结果
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
