import { define as d, s, text } from "./define.ts";
import type { Json } from "./types.ts";
function parse(v: string): Json {
  return JSON.parse(v);
}
function object(v: string) {
  const x = parse(v);
  if (x === null || Array.isArray(x) || typeof x !== "object")
    throw Error("Expected a JSON object");
  return x;
}
function sort(value: Json): Json {
  if (Array.isArray(value)) return value.map(sort);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([k, v]) => [k, sort(v)]),
    );
  return value;
}
export const jsonActions = [
  d(
    "json.format",
    "JSON 格式化",
    "Format JSON",
    "校验并以两空格缩进 JSON；数字遵循 JS 精度。",
    "JSON",
    { text: s },
    "string",
    { text: '{"a":1}' },
    (i) => JSON.stringify(parse(text(i)), null, 2),
    '{\n  "a": 1\n}',
  ),
  d(
    "json.minify",
    "JSON 压缩",
    "Minify JSON",
    "校验并移除 JSON 非必要空白。",
    "JSON",
    { text: s },
    "string",
    { text: '{ "a": 1 }' },
    (i) => JSON.stringify(parse(text(i))),
    '{"a":1}',
  ),
  d(
    "json.validate",
    "JSON 校验",
    "Validate JSON",
    "验证 JSON 语法，格式错误时返回统一错误。",
    "JSON",
    { text: s },
    "object",
    { text: "[1,2]" },
    (i) => {
      const v = parse(text(i));
      return {
        valid: true,
        type: v === null ? "null" : Array.isArray(v) ? "array" : typeof v,
      };
    },
  ),
  d(
    "json.keys",
    "JSON 键列表",
    "Object keys",
    "读取对象顶层键名。",
    "JSON",
    { text: s },
    "array",
    { text: '{"a":1,"b":2}' },
    (i) => Object.keys(object(text(i))),
    ["a", "b"],
  ),
  d(
    "json.sort",
    "JSON 键排序",
    "Sort JSON keys",
    "递归排序对象键，保留数组顺序。",
    "JSON",
    { text: s },
    "string",
    { text: '{"b":2,"a":1}' },
    (i) => JSON.stringify(sort(parse(text(i))), null, 2),
    '{\n  "a": 1,\n  "b": 2\n}',
  ),
  d(
    "json.pointer",
    "JSON Pointer 查询",
    "JSON Pointer",
    "通过 RFC 6901 Pointer 查询，支持 ~0 和 ~1。",
    "JSON",
    { text: s, pointer: s },
    "object",
    { text: '{"a/b":[42]}', pointer: "/a~1b/0" },
    (i) => {
      let value = parse(text(i));
      const p = text(i, "pointer");
      if (p && !p.startsWith("/")) throw Error("Pointer must start with /");
      for (const raw of p ? p.slice(1).split("/") : []) {
        if (/~(?:[^01]|$)/.test(raw)) throw Error("Invalid pointer escape");
        const k = raw.replace(/~1/g, "/").replace(/~0/g, "~");
        if (!value || typeof value !== "object" || !Object.hasOwn(value, k))
          throw Error("Pointer does not exist");
        value = (value as Record<string, Json>)[k];
      }
      return { value };
    },
  ),
  d(
    "json.array.ndjson",
    "JSON 转 NDJSON",
    "JSON array to NDJSON",
    "将顶层数组转换为每行一个 JSON 值。",
    "JSON",
    { text: s },
    "string",
    { text: '[1,{"a":2}]' },
    (i) => {
      const v = parse(text(i));
      if (!Array.isArray(v)) throw Error("Expected array");
      return v.map((x) => JSON.stringify(x)).join("\n");
    },
    '1\n{"a":2}',
  ),
  d(
    "json.ndjson.array",
    "NDJSON 转 JSON",
    "NDJSON to JSON",
    "逐行校验并转换为 JSON 数组，跳过空行。",
    "JSON",
    { text: s },
    "string",
    { text: '1\n{"a":2}' },
    (i) =>
      JSON.stringify(
        text(i)
          .split(/\r?\n/)
          .filter((x) => x.trim())
          .map((x) => parse(x)),
        null,
        2,
      ),
    '[\n  1,\n  {\n    "a": 2\n  }\n]',
  ),
];
