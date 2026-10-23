import { jsonrepair } from "jsonrepair";
import TurndownService from "turndown";
import { define as d, s, text, num } from "./define.ts";
import type { Input, Json } from "./types.ts";

function flatten(value: Json, prefix = "", out: Record<string, Json> = {}) {
  if (Array.isArray(value)) {
    if (!value.length && prefix) out[prefix] = [];
    value.forEach((item, index) =>
      flatten(item, prefix ? `${prefix}[${index}]` : `[${index}]`, out),
    );
    return out;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    if (!entries.length && prefix) out[prefix] = {};
    for (const [key, item] of entries)
      flatten(item, prefix ? `${prefix}.${key}` : key, out);
    return out;
  }
  out[prefix || "value"] = value;
  return out;
}

function hex(value: string) {
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw Error("Use #RRGGBB");
  return value.toUpperCase();
}

export const modernTools = [
  d(
    "json.repair",
    "JSON 智能修复",
    "Repair JSON",
    "修复缺失引号、逗号、注释、尾逗号等常见损坏 JSON，再输出标准格式。由 jsonrepair 驱动。",
    "JSON",
    { text: s },
    "string",
    { text: "{name: 'LR', tools: [1,2,3,],}" },
    (i) => JSON.stringify(JSON.parse(jsonrepair(text(i))), null, 2),
  ),
  d(
    "json.flatten",
    "JSON 扁平化",
    "Flatten JSON",
    "把嵌套对象和数组转换为点路径 / 索引路径，便于查字段、做表格或调试。",
    "JSON",
    { text: s },
    "object",
    { text: '{"user":{"name":"LR","skills":["JS","Rust"]}}' },
    (i) => {
      const value = JSON.parse(text(i)) as Json;
      return flatten(value);
    },
  ),
  d(
    "html.to.markdown",
    "HTML 转 Markdown",
    "HTML to Markdown",
    "把网页片段、富文本和编辑器 HTML 转成干净 Markdown。由 Turndown 驱动。",
    "Markdown",
    { text: s },
    "string",
    { text: "<h1>LR Toolbox X</h1><p>Hello <strong>world</strong>.</p>" },
    (i) => {
      const service = new TurndownService({
        headingStyle: "atx",
        bulletListMarker: "-",
        codeBlockStyle: "fenced",
        emDelimiter: "*",
        strongDelimiter: "**",
      });
      service.remove(["script", "style", "iframe", "object", "embed"]);
      return service.turndown(text(i));
    },
  ),
  d(
    "developer.regex.test",
    "正则表达式测试器",
    "Regex tester",
    "在本地测试 JavaScript 正则，返回匹配文本、索引和捕获组；默认最多返回 200 个匹配。",
    "Developer",
    { pattern: s, flags: s, text: s },
    "object",
    {
      pattern: "(LR)-(?<tool>Toolbox)",
      flags: "gi",
      text: "LR-Toolbox / lr-toolbox",
    },
    (i) => {
      const pattern = text(i, "pattern");
      const flags = text(i, "flags");
      if (!/^[dgimsuvy]*$/.test(flags) || new Set(flags).size !== flags.length)
        throw Error("Invalid or duplicate RegExp flags");
      const source = text(i);
      const re = new RegExp(pattern, flags);
      const matches: Json[] = [];
      if (flags.includes("g") || flags.includes("y")) {
        let match: RegExpExecArray | null;
        while ((match = re.exec(source)) && matches.length < 200) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            named: match.groups ?? {},
          });
          if (match[0] === "") re.lastIndex += 1;
        }
      } else {
        const match = re.exec(source);
        if (match)
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            named: match.groups ?? {},
          });
      }
      return {
        count: matches.length,
        matches,
        truncated: matches.length >= 200,
      };
    },
  ),
  d(
    "color.gradient.css",
    "CSS 渐变生成器",
    "CSS gradient builder",
    "用两个 HEX 颜色和角度生成可直接复制的 linear-gradient CSS。",
    "Colors",
    {
      start: s,
      end: s,
      angle: { type: "number", minimum: -360, maximum: 360 },
    },
    "string",
    { start: "#596FE8", end: "#A06DE4", angle: 135 },
    (i: Input) =>
      `linear-gradient(${num(i, "angle")}deg, ${hex(text(i, "start"))}, ${hex(text(i, "end"))})`,
    "linear-gradient(135deg, #596FE8, #A06DE4)",
  ),
];
