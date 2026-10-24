import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import categories from "./cyberchef-categories.json";
import { ToolIcon } from "./Icons.tsx";
import { download } from "./storage.ts";
import "./cyberchef-workspace.css";

const labels: Record<string, string> = {
  "Data format": "数据格式",
  "Encryption / Encoding": "加密与编码",
  "Public Key": "公钥与证书",
  "Arithmetic / Logic": "运算与逻辑",
  Extractors: "内容提取",
  Compression: "压缩",
  Hashing: "哈希",
  "Code tidy": "代码整理",
  Forensics: "文件分析",
  Multimedia: "多媒体",
  Networking: "网络",
  Language: "语言与文本",
  Utils: "实用工具",
  Other: "其他",
  "Flow control": "流程控制",
  "Date / Time": "日期与时间",
};
export const chefOperations = [...new Set(categories.flatMap((c) => c.ops))]
  .filter((name) => name !== "Automated Validation Test Op")
  .map((name) => ({
    name,
    categories: categories
      .filter((c) => c.ops.includes(name))
      .map((c) => c.name),
  }));
const quick = [
  { name: "To Base64", zh: "Base64 编码", args: [] },
  { name: "From Base64", zh: "Base64 解码", args: [] },
  { name: "SHA2", zh: "SHA-256 摘要", args: [256, 64, 160] },
  { name: "URL Decode", zh: "URL 解码", args: [] },
  { name: "Entropy", zh: "熵分析", args: [] },
  { name: "Magic", zh: "自动识别编码", args: [3, false, false, ""] },
];
function recipeUrl(name: string, args: unknown[] = []) {
  return `./engines/cyberchef/index.html#recipe=${encodeURIComponent(JSON.stringify([{ op: name, args }]))}`;
}
export function CyberChefWorkspace({
  en,
  onClose,
}: {
  en: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState("");
  const [source, setSource] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [focused, setFocused] = useState(false);
  const fuse = useMemo(
    () =>
      new Fuse(chefOperations, {
        keys: ["name", "categories"],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [],
  );
  const matches = (
    query.trim()
      ? fuse.search(query, { limit: 100 }).map((x) => x.item)
      : chefOperations
  ).filter((x) => !category || x.categories.includes(category));
  const categoryNames = categories
    .filter((c) => c.ops.length && c.name !== "Favourites")
    .map((c) => c.name);
  const launch = (name: string, args: unknown[] = []) => {
    setSelected(name);
    setFocused(true);
    setLoaded(false);
    setSource(name ? recipeUrl(name, args) : "./engines/cyberchef/index.html");
  };
  return (
    <section className="chef-workspace" aria-label="CyberChef Suite">
      <button className="chef-back" onClick={onClose}>
        ← {en ? "Back to tools" : "返回工具箱"}
      </button>
      <div className="chef-hero">
        <ToolIcon category="Code" />
        <div>
          <span>OPEN SOURCE SUITE / GCHQ</span>
          <h1>CyberChef 数据实验室</h1>
          <p>把编码、文件分析与多步处理，放进一张真正能工作的操作台。</p>
        </div>
        <div className="chef-metric">
          <strong>{chefOperations.length}</strong>
          <span>固定版本上游操作目录</span>
        </div>
      </div>
      <div className="chef-facts">
        <span>自托管 v11.5.0</span>
        <span>Apache-2.0</span>
        <span>按需加载完整引擎</span>
        <a
          href="https://github.com/gchq/CyberChef"
          target="_blank"
          rel="noreferrer"
        >
          GitHub 源码 ↗
        </a>
        <a
          href="./engines/cyberchef/LICENSE.txt"
          target="_blank"
          rel="noreferrer"
        >
          开源许可 ↗
        </a>
      </div>
      <p className="chef-explanation">
        这是整套开源应用的本地部署，目录去重后排除了上游测试操作。
        {chefOperations.length}{" "}
        项是上游操作数，包含与工具箱已有功能重叠的操作，不与 128
        个便携工具直接相加。部分操作需要特定输入、额外模块或网络能力；未逐项实测全部上游操作。
      </p>
      <div className="chef-quick" aria-label="常用配方">
        {quick.map((item) => (
          <button key={item.name} onClick={() => launch(item.name, item.args)}>
            {item.zh} →
          </button>
        ))}
        <button onClick={() => launch("")}>打开完整操作台 →</button>
      </div>
      <div className={"chef-layout" + (focused ? " chef-focused" : "")}>
        {!focused && (
          <aside className="chef-browser">
            <h2>找一项操作</h2>
            <label>
              按名称搜索
              <input
                aria-label="搜索 CyberChef 操作"
                placeholder="Base64 / JSON / SHA / Extract…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label>
              按场景筛选
              <select
                aria-label="CyberChef 分类"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">全部分类</option>
                {categoryNames.map((name) => (
                  <option key={name} value={name}>
                    {labels[name] ?? name} / {name}
                  </option>
                ))}
              </select>
            </label>
            <p>
              显示 {matches.length} 项{query ? "（搜索最多 100 项）" : ""}
            </p>
            <div className="chef-operation-list">
              {matches.map((op) => (
                <button
                  key={op.name}
                  aria-pressed={op.name === selected}
                  onClick={() => launch(op.name)}
                >
                  <strong>{op.name}</strong>
                  <span>
                    {op.categories.map((c) => labels[c] ?? c).join(" · ")}
                  </span>
                </button>
              ))}
              {!matches.length && <p>没有匹配项，试试英文关键词。</p>}
            </div>
            <button
              onClick={() =>
                download(
                  "CyberChef-11.5.0-operation-catalog.json",
                  JSON.stringify(chefOperations, null, 2),
                  "application/json",
                )
              }
            >
              下载完整操作目录 JSON ↓
            </button>
          </aside>
        )}
        <div className="chef-runtime">
          <div className="chef-runtime-title">
            <div>
              <span>YOUR WORKBENCH</span>
              <h2>{selected || "准备开始你的第一个配方"}</h2>
            </div>
            {source && (
              <div className="chef-view-controls">
                <button onClick={() => setFocused(!focused)}>
                  {focused ? "显示操作目录" : "专注工作台"}
                </button>
                <button onClick={() => launch(selected)}>重新打开</button>
              </div>
            )}
          </div>
          {source ? (
            <>
              <p role="status">
                {loaded
                  ? "工作台已载入。将数据粘贴到 Input，调整 Recipe，结果显示在 Output。"
                  : "正在载入完整开源引擎…"}
              </p>
              <iframe
                key={source}
                title="CyberChef local workbench"
                src={source}
                sandbox="allow-scripts allow-same-origin allow-downloads"
                referrerPolicy="no-referrer"
                onLoad={() => setLoaded(true)}
              />
            </>
          ) : (
            <div className="chef-empty">
              <ToolIcon category="workflow" />
              <h3>从一个操作开始，串成完整流程。</h3>
              <p>
                例如：From Base64 → Gunzip → JSON
                Beautify。配方、输入和输出都在独立工作区中操作。
              </p>
              <button onClick={() => launch("To Base64")}>
                试用 Base64 编码 →
              </button>
              <p>
                引擎由本站提供，不跳转到外站。首次加载较大，不影响日常工具启动；套件资源不预缓存，离线时需已加载所需模块。
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
