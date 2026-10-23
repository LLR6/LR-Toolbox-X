import { define as d, text } from "./define.ts";
import type { Json } from "./types.ts";
const small = { type: "string", maxLength: 20000 };
function bounded(value: string) {
  if (value.split("\n").length > 2000)
    throw Error("Use at most 2000 lines per text");
  return value;
}
const before = { ...small, title: "原始文本" },
  after = { ...small, title: "修改后文本" };
function jsonValue(value: unknown) {
  let nodes = 0,
    characters = 0;
  const seen = new WeakSet<object>();
  function walk(value: unknown, depth = 0): Json {
    if (++nodes > 20000 || depth > 60)
      throw Error("Data exceeds 20000 nodes or 60 levels");
    if (value === null || value === undefined) return null;
    if (typeof value === "string") {
      characters += value.length;
      if (characters > 400000)
        throw Error("Expanded strings exceed 400000 characters");
      return value;
    }
    if (typeof value === "boolean") return value;
    if (typeof value === "number") {
      if (!Number.isFinite(value))
        throw Error("Only finite numbers are supported");
      return value;
    }
    if (typeof value !== "object")
      throw Error("Only JSON-compatible YAML is supported");
    if (seen.has(value))
      throw Error("Repeated or circular references are unsupported");
    seen.add(value);
    if (Array.isArray(value)) return value.map((item) => walk(item, depth + 1));
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => {
        characters += key.length;
        if (characters > 400000)
          throw Error("Expanded keys exceed 400000 characters");
        return [key, walk(entry, depth + 1)];
      }),
    );
  }
  return { value: walk(value), nodes };
}
async function yaml(value: string) {
  if (!value.trim()) return jsonValue(null);
  const { load, JSON_SCHEMA } = await import("js-yaml");
  return jsonValue(
    load(value, {
      schema: JSON_SCHEMA,
      json: false,
      maxDepth: 60,
      maxAliases: 0,
    }),
  );
}
const yamlInput = { type: "string", maxLength: 200000, title: "YAML 内容" };
const escape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
async function renderMarkdown(value: string) {
  const { Marked, Renderer } = await import("marked");
  const renderer = new Renderer();
  renderer.html = ({ text }) => escape(text);
  renderer.image = ({ text }) =>
    `<span class="image-placeholder">[${escape(text || "image")}]</span>`;
  renderer.link = function ({ href, tokens }) {
    const label = this.parser.parseInline(tokens);
    let allowed = href.startsWith("#");
    try {
      allowed ||= ["https:", "http:", "mailto:"].includes(
        new URL(href).protocol,
      );
    } catch {
      /* Relative links render as text. */
    }
    return allowed
      ? `<a href="${escape(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`
      : label;
  };
  const markdown = new Marked({ renderer, gfm: true, breaks: false });
  return markdown.parse(bounded(value), { async: false });
}
export const studioActions = [
  d(
    "text.diff",
    "文本差异对比",
    "Compare text differences",
    "按行、单词或字符显示新增与删除；每段最多 20000 字符 / 2000 行，复杂差异会中止。",
    "Diff",
    {
      before,
      after,
      mode: {
        type: "string",
        title: "对比方式",
        enum: ["lines", "words", "characters"],
      },
    },
    "object",
    {
      before: "Hello LR\n旧内容\n",
      after: "Hello LR\n新内容\n",
      mode: "lines",
    },
    async (i) => {
      const { diffLines, diffWordsWithSpace, diffChars } = await import("diff");
      const a = bounded(text(i, "before")),
        b = bounded(text(i, "after")),
        mode = text(i, "mode"),
        options = { timeout: 500, maxEditLength: 2048 };
      const changes =
        mode === "lines"
          ? diffLines(a, b, options)
          : mode === "words"
            ? diffWordsWithSpace(a, b, options)
            : diffChars(a, b, options);
      if (!changes)
        throw Error("Diff complexity limit reached; compare smaller sections");
      return {
        kind: "diff",
        mode,
        added: changes.filter((c) => c.added).reduce((n, c) => n + c.count, 0),
        removed: changes
          .filter((c) => c.removed)
          .reduce((n, c) => n + c.count, 0),
        changes: changes.map(({ value, added, removed, count }) => ({
          value,
          added,
          removed,
          count,
        })),
      };
    },
  ),
  d(
    "patch.create",
    "生成统一补丁",
    "Create unified patch",
    "对比两个文本，生成单文件 unified diff；不访问磁盘，最多 2000 行。",
    "Diff",
    { before, after },
    "string",
    { before: "Hello LR\nold\n", after: "Hello LR\nnew\n" },
    async (i) => {
      const { createTwoFilesPatch } = await import("diff");
      const patch = createTwoFilesPatch(
        "before.txt",
        "after.txt",
        bounded(text(i, "before")),
        bounded(text(i, "after")),
        undefined,
        undefined,
        { context: 3, timeout: 500, maxEditLength: 2048 },
      );
      if (patch === undefined) throw Error("Patch complexity limit reached");
      return patch;
    },
  ),
  d(
    "patch.apply",
    "应用文本补丁",
    "Apply a text patch",
    "把单文件 unified diff 应用于输入文本，要求上下文匹配；只返回结果，不修改磁盘文件。",
    "Diff",
    {
      text: { ...small, title: "原始文本" },
      patch: { type: "string", maxLength: 50000, title: "Unified diff 补丁" },
    },
    "string",
    {
      text: "hello\n",
      patch: "--- before.txt\n+++ after.txt\n@@ -1,1 +1,1 @@\n-hello\n+world\n",
    },
    async (i) => {
      const { parsePatch, applyPatch } = await import("diff");
      const patches = parsePatch(text(i, "patch"));
      if (
        patches.length !== 1 ||
        patches[0].hunks.length > 1000 ||
        patches[0].isBinary
      )
        throw Error("Use a single-file patch with at most 1000 hunks");
      const result = applyPatch(bounded(text(i)), patches[0], {
        fuzzFactor: 0,
        autoConvertLineEndings: false,
      });
      if (result === false)
        throw Error("Patch does not match the original text");
      if (result.length > 60000)
        throw Error("Patched output exceeds 60000 characters");
      return result;
    },
    "world\n",
  ),
  d(
    "yaml.to.json",
    "YAML 转 JSON",
    "Convert YAML to JSON",
    "将单文档 YAML 转为 JSON；拒绝重复键、别名、自定义标签及超过 60 层的结构。",
    "YAML",
    { text: yamlInput },
    "string",
    { text: "name: LR Toolbox\nenabled: true\ntags:\n  - offline\n  - 中文\n" },
    async (i) => JSON.stringify((await yaml(text(i))).value, null, 2),
  ),
  d(
    "yaml.from.json",
    "JSON 转 YAML",
    "Convert JSON to YAML",
    "将 JSON 转为 YAML，保留字符串类型、中文和键顺序；不展开引用。",
    "YAML",
    { text: { type: "string", maxLength: 200000, title: "JSON 内容" } },
    "string",
    { text: '{"name":"LR","enabled":true,"code":"001"}' },
    async (i) => {
      const { dump, JSON_SCHEMA } = await import("js-yaml");
      return dump(jsonValue(JSON.parse(text(i))).value, {
        schema: JSON_SCHEMA,
        noRefs: true,
        lineWidth: 100,
        sortKeys: false,
      });
    },
  ),
  d(
    "yaml.validate",
    "YAML 校验与概览",
    "Validate YAML",
    "检查单文档 YAML 语法、重复键和 JSON 兼容性，返回根类型与节点数量；别名不受支持。",
    "YAML",
    { text: yamlInput },
    "object",
    { text: "name: LR\nenabled: true" },
    async (i) => {
      const { value, nodes } = await yaml(text(i));
      return {
        valid: true,
        rootType:
          value === null
            ? "null"
            : Array.isArray(value)
              ? "array"
              : typeof value,
        nodes,
      };
    },
    { valid: true, rootType: "object", nodes: 3 },
  ),
  d(
    "markdown.render",
    "Markdown 排版预览",
    "Render Markdown document",
    "把 Markdown 渲染为可下载 HTML 文档；原始 HTML 显示为文本，图片只显示替代文字，不加载外部资源。",
    "Markdown",
    { text: { ...small, title: "Markdown 内容" } },
    "string",
    {
      text: "# LR Toolbox\n\n**离线创造**，专注你的工作。\n\n| 工具 | 状态 |\n|---|---|\n| Markdown | 就绪 |\n\n```js\nconsole.log('Hello LR');\n```",
    },
    async (i) => {
      const body = await renderMarkdown(text(i));
      if (body.length > 300000)
        throw Error("Rendered HTML exceeds 300000 characters");
      return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'"><title>Markdown document</title><style>body{font:16px/1.8 system-ui,sans-serif;color:#23324b;background:#fff;max-width:860px;margin:0 auto;padding:30px;overflow-wrap:anywhere}h1,h2,h3{line-height:1.4;color:#152948}h1{border-bottom:2px solid #e5eaf2;padding-bottom:14px}a{color:#526cca}pre{background:#101d32;color:#d8e7ff;padding:18px;border-radius:10px;overflow:auto}code{font-family:monospace}table{border-collapse:collapse;display:block;overflow:auto}td,th{border:1px solid #dbe3ef;padding:9px 16px}th{background:#eef3fa}blockquote{border-left:3px solid #8ca3db;margin-left:0;padding-left:18px;color:#697c98}.image-placeholder{color:#8793a6}input{pointer-events:none}</style></head><body>${body}</body></html>`;
    },
  ),
];
