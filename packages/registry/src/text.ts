import { define as d, s, text } from "./define.ts";
export const textActions = [
  d(
    "text.trim",
    "清理首尾空白",
    "Trim whitespace",
    "移除文本首尾空白，保留内部格式。",
    "Text",
    { text: s },
    "string",
    { text: "  你好  " },
    (i) => text(i).trim(),
    "你好",
  ),
  d(
    "text.lines.unique",
    "行去重",
    "Unique lines",
    "按首次出现顺序去重，区分大小写。",
    "Text",
    { text: s },
    "string",
    { text: "a\nb\na" },
    (i) => [...new Set(text(i).split(/\r?\n/))].join("\n"),
    "a\nb",
  ),
  d(
    "text.lines.sort",
    "行排序",
    "Sort lines",
    "使用 Unicode 码点顺序排序。",
    "Text",
    { text: s },
    "string",
    { text: "b\na" },
    (i) => text(i).split(/\r?\n/).sort().join("\n"),
    "a\nb",
  ),
  d(
    "text.lines.reverse",
    "倒序排列行",
    "Reverse lines",
    "倒序排列文本行。",
    "Text",
    { text: s },
    "string",
    { text: "a\nb" },
    (i) => text(i).split(/\r?\n/).reverse().join("\n"),
    "b\na",
  ),
  d(
    "text.lines.nonempty",
    "删除空白行",
    "Remove blank lines",
    "删除内容为空或只有空格的行。",
    "Text",
    { text: s },
    "string",
    { text: "a\n \nb" },
    (i) =>
      text(i)
        .split(/\r?\n/)
        .filter((x) => x.trim())
        .join("\n"),
    "a\nb",
  ),
  d(
    "text.stats",
    "文本统计",
    "Text statistics",
    "统计码点、UTF-8 字节、行和空白分隔词。",
    "Text",
    { text: s },
    "object",
    { text: "你好 LR" },
    (i) => ({
      codePoints: [...text(i)].length,
      utf8Bytes: new TextEncoder().encode(text(i)).length,
      lines: text(i) ? text(i).split(/\r?\n/).length : 0,
      words: text(i).trim() ? text(i).trim().split(/\s+/).length : 0,
    }),
  ),
  d(
    "text.replace",
    "字面替换",
    "Literal replace",
    "替换所有字面匹配内容，不使用正则表达式。",
    "Text",
    { text: s, search: { ...s, maxLength: 10000 }, replacement: s },
    "string",
    { text: "hello LR", search: "LR", replacement: "世界" },
    (i) => {
      if (!text(i, "search")) throw Error("Search cannot be empty");
      const parts = text(i).split(text(i, "search"));
      if (
        parts.reduce((n, v) => n + v.length, 0) +
          (parts.length - 1) * text(i, "replacement").length >
        1000000
      )
        throw Error("Result exceeds size limit");
      const result = parts.join(text(i, "replacement"));
      if (result.length > 1000000) throw Error("Result exceeds size limit");
      return result;
    },
    "hello 世界",
  ),
  d(
    "text.normalize",
    "Unicode 标准化",
    "Unicode NFC",
    "将组合字符转换为 NFC 标准形式。",
    "Text",
    { text: s },
    "string",
    { text: "e\u0301" },
    (i) => text(i).normalize("NFC"),
    "é",
  ),
  d(
    "text.newlines.lf",
    "统一换行",
    "Normalize LF",
    "将 CRLF 和 CR 转换为 LF。",
    "Text",
    { text: s },
    "string",
    { text: "a\r\nb\rc" },
    (i) => text(i).replace(/\r\n?/g, "\n"),
    "a\nb\nc",
  ),
  d(
    "text.lines.number",
    "添加行号",
    "Number lines",
    "为每一行添加从 1 开始的编号。",
    "Text",
    { text: s },
    "string",
    { text: "a\nb" },
    (i) =>
      text(i)
        .split(/\r?\n/)
        .map((x, n) => `${n + 1}. ${x}`)
        .join("\n"),
    "1. a\n2. b",
  ),
  d(
    "text.html.escape",
    "HTML 转义",
    "Escape HTML",
    "转义 HTML 特殊字符，结果作为纯文本展示。",
    "Encoding",
    { text: s },
    "string",
    { text: '<b>&"' },
    (i) =>
      text(i).replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c]!,
      ),
    "&lt;b&gt;&amp;&quot;",
  ),
];
