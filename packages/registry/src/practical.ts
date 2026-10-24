import { define as d, s, text, num } from "./define.ts";
import type { Json } from "./types.ts";

function lines(value: string) {
  return value.split(/\r\n|\n|\r/).filter((x) => x !== "");
}
function merge(target: Json, patch: Json, depth = 0): Json {
  if (depth > 64) throw Error("JSON nesting exceeds 64 levels");
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return patch;
  const result: Record<string, Json> = Object.create(null);
  if (target && typeof target === "object" && !Array.isArray(target)) {
    for (const [k, v] of Object.entries(target)) result[k] = v;
  }
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) delete result[k];
    else
      result[k] = merge(
        Object.hasOwn(result, k) ? result[k] : null,
        v,
        depth + 1,
      );
  }
  return result;
}
export const practicalActions = [
  d(
    "text.lists.compare",
    "两份名单对比",
    "Compare two lists",
    "逐行精确比较两份名单，返回交集和各自独有项；去重、忽略空行，保留空格与首次出现顺序。",
    "Text",
    { left: s, right: s },
    "object",
    { left: "李明\n王芳\n张伟", right: "王芳\n赵敏" },
    (i) => {
      const a = new Set(lines(text(i, "left"))),
        b = new Set(lines(text(i, "right")));
      return {
        common: [...a].filter((x) => b.has(x)),
        onlyLeft: [...a].filter((x) => !b.has(x)),
        onlyRight: [...b].filter((x) => !a.has(x)),
      };
    },
  ),
  d(
    "text.lines.frequency",
    "重复行频次统计",
    "Line frequency report",
    "统计每个非空行的出现次数，按频次降序排列，同频保留首次出现顺序；精确区分空格和大小写。",
    "Text",
    { text: s },
    "object",
    { text: "apple\nbanana\napple\n梨\n梨\n梨" },
    (i) => {
      const counts = new Map<string, number>();
      for (const line of lines(text(i)))
        counts.set(line, (counts.get(line) ?? 0) + 1);
      return {
        total: [...counts.values()].reduce((a, b) => a + b, 0),
        unique: counts.size,
        rows: [...counts]
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count),
      };
    },
  ),
  d(
    "text.invisible.inspect",
    "不可见字符检查",
    "Inspect invisible characters",
    "定位常见控制字符、零宽字符、不换行空格及双向文本标记。位置为从 1 开始的 Unicode 码点序号；最多列出 10000 项，不修改原文。",
    "Text",
    { text: s },
    "object",
    { text: "hello\u200b world\u00a0!" },
    (i) => {
      const matches: Json[] = [];
      let position = 0,
        total = 0;
      const names: Record<number, string> = {
        9: "TAB",
        10: "LF",
        13: "CR",
        160: "NO-BREAK SPACE",
        173: "SOFT HYPHEN",
        8203: "ZERO WIDTH SPACE",
        8204: "ZERO WIDTH NON-JOINER",
        8205: "ZERO WIDTH JOINER",
        8206: "LEFT-TO-RIGHT MARK",
        8207: "RIGHT-TO-LEFT MARK",
        8288: "WORD JOINER",
        65279: "BOM / ZERO WIDTH NO-BREAK SPACE",
      };
      for (const char of text(i)) {
        position++;
        const cp = char.codePointAt(0)!;
        if (
          cp < 32 ||
          (cp >= 127 && cp <= 159) ||
          cp === 160 ||
          cp === 173 ||
          (cp >= 8203 && cp <= 8207) ||
          (cp >= 8234 && cp <= 8238) ||
          (cp >= 8288 && cp <= 8297) ||
          cp === 65279
        ) {
          total++;
          if (matches.length < 10000)
            matches.push({
              position,
              codepoint: "U+" + cp.toString(16).toUpperCase().padStart(4, "0"),
              name: names[cp] ?? "CONTROL / FORMAT CHARACTER",
            });
        }
      }
      return { total, truncated: total > matches.length, matches };
    },
  ),
  d(
    "text.chunk",
    "长文本等长分段",
    "Split long text",
    "按 Unicode 码点分段，不拆开 emoji 的代理对；组合字符或复合 emoji 可能跨段。每段 1–100000 码点，最多输出 10000 段。",
    "Text",
    { text: s, size: { type: "integer", minimum: 1, maximum: 100000 } },
    "array",
    { text: "一份长文，分段后更容易处理。", size: 6 },
    (i) => {
      const chars = Array.from(text(i)),
        size = num(i, "size");
      if (Math.ceil(chars.length / size) > 10000)
        throw Error("Too many chunks; increase size");
      const result: string[] = [];
      for (let n = 0; n < chars.length; n += size)
        result.push(chars.slice(n, n + size).join(""));
      return result;
    },
  ),
  d(
    "url.tracking.clean",
    "链接追踪参数清理",
    "Clean tracking parameters",
    "移除 HTTP(S) 链接中的 utm_*、fbclid、gclid、dclid、msclkid 和 mc_*id 参数，保留其他参数与片段；不访问链接，签名链接修改后可能失效。",
    "Developer",
    { text: s },
    "object",
    {
      text: "https://example.com/article?id=42&utm_source=share&fbclid=abc#intro",
    },
    (i) => {
      const url = new URL(text(i));
      if (!["http:", "https:"].includes(url.protocol))
        throw Error("Use an absolute HTTP(S) URL");
      const removed = [
        ...new Set(
          [...url.searchParams.keys()].filter(
            (k) =>
              /^utm_/i.test(k) ||
              /^(fbclid|gclid|dclid|msclkid|mc_cid|mc_eid)$/i.test(k),
          ),
        ),
      ];
      for (const key of removed) url.searchParams.delete(key);
      return { url: url.href, removed };
    },
  ),
  d(
    "json.merge.patch",
    "JSON 合并补丁",
    "JSON Merge Patch",
    "按 RFC 7396 合并配置：对象递归合并，null 删除字段，数组及非对象整体替换。支持最多 64 层补丁对象；数字遵循 JS 精度。",
    "JSON",
    { target: s, patch: s },
    "string",
    {
      target: '{"name":"LR","settings":{"theme":"light","old":true}}',
      patch: '{"settings":{"theme":"dark","old":null}}',
    },
    (i) =>
      JSON.stringify(
        merge(
          JSON.parse(text(i, "target")) as Json,
          JSON.parse(text(i, "patch")) as Json,
        ),
        null,
        2,
      ),
  ),
];
