import { define as d, s, n, text, num, dateInput, bytesHex } from "./define.ts";
function color(value: string) {
  if (!/^#[\da-f]{6}$/i.test(value)) throw Error("Use #RRGGBB");
  return [1, 3, 5].map((k) => parseInt(value.slice(k, k + 2), 16));
}
export const developerActions = [
  d(
    "url.parse",
    "URL 解析",
    "Parse URL",
    "解析绝对 URL 的协议、主机、端口与参数。",
    "Developer",
    { text: s },
    "object",
    { text: "https://example.com/a?q=LR" },
    (i) => {
      const u = new URL(text(i));
      return {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port,
        pathname: u.pathname,
        search: u.search,
        hash: u.hash,
        parameters: Array.from(u.searchParams).map(([key, value]) => ({
          key,
          value,
        })),
      };
    },
  ),
  d(
    "url.query.parse",
    "查询参数解析",
    "Parse query string",
    "保留重复参数和空值。",
    "Developer",
    { text: s },
    "object",
    { text: "a=1&a=2" },
    (i) => ({
      entries: Array.from(new URLSearchParams(text(i))).map(([key, value]) => ({
        key,
        value,
      })),
    }),
  ),
  d(
    "url.query.build",
    "构建查询参数",
    "Build query string",
    "JSON 对象的字符串值编码为查询参数。",
    "Developer",
    { text: s },
    "string",
    { text: '{"q":"你好"}' },
    (i) => {
      const o = JSON.parse(text(i));
      if (
        !o ||
        Array.isArray(o) ||
        typeof o !== "object" ||
        Object.values(o).some((v) => typeof v !== "string")
      )
        throw Error("Expected an object with string values");
      return new URLSearchParams(o).toString();
    },
    "q=%E4%BD%A0%E5%A5%BD",
  ),
  d(
    "time.iso.timestamp",
    "日期转时间戳",
    "ISO to Unix timestamp",
    "ISO 日期转换为 Unix 秒（包含小数）。",
    "Time",
    { text: s },
    "number",
    { text: "1970-01-01T00:00:01Z" },
    (i) => dateInput(text(i)).getTime() / 1000,
    1,
  ),
  d(
    "time.timestamp.iso",
    "时间戳转日期",
    "Unix timestamp to ISO",
    "Unix 秒转换为 UTC ISO 日期。",
    "Time",
    { seconds: { ...n, minimum: -8640000000000, maximum: 8640000000000 } },
    "string",
    { seconds: 0 },
    (i) => new Date(num(i, "seconds") * 1000).toISOString(),
    "1970-01-01T00:00:00.000Z",
  ),
  d(
    "time.difference",
    "日期差值",
    "Date difference",
    "计算带时区 ISO 日期之间的秒数。",
    "Time",
    { start: s, end: s },
    "number",
    { start: "2026-01-01T00:00:00Z", end: "2026-01-02T00:00:00Z" },
    (i) =>
      (dateInput(text(i, "end")).getTime() -
        dateInput(text(i, "start")).getTime()) /
      1000,
    86400,
  ),
  d(
    "color.hex.rgb",
    "HEX 转 RGB",
    "HEX to RGB",
    "解析六位 HEX 颜色。",
    "Colors",
    { text: s },
    "object",
    { text: "#74E0B8" },
    (i) => {
      const [r, g, b] = color(text(i));
      return { r, g, b };
    },
  ),
  d(
    "color.rgb.hex",
    "RGB 转 HEX",
    "RGB to HEX",
    "RGB 整数转换为 HEX 颜色。",
    "Colors",
    {
      r: { type: "integer", minimum: 0, maximum: 255 },
      g: { type: "integer", minimum: 0, maximum: 255 },
      b: { type: "integer", minimum: 0, maximum: 255 },
    },
    "string",
    { r: 116, g: 224, b: 184 },
    (i) =>
      "#" +
      ["r", "g", "b"]
        .map((k) => num(i, k).toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase(),
    "#74E0B8",
  ),
  d(
    "color.contrast",
    "颜色对比度",
    "WCAG contrast ratio",
    "计算 WCAG 2.x sRGB 相对亮度对比度。",
    "Colors",
    { foreground: s, background: s },
    "object",
    { foreground: "#000000", background: "#FFFFFF" },
    (i) => {
      const l = (v: string) =>
        color(v)
          .map((c) => c / 255)
          .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
          .reduce((a, c, k) => a + c * [0.2126, 0.7152, 0.0722][k], 0);
      const a = l(text(i, "foreground")),
        b = l(text(i, "background"));
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      return { ratio, aaNormal: ratio >= 4.5, aaaNormal: ratio >= 7 };
    },
  ),
  d(
    "developer.uuid.v4",
    "UUID v4",
    "Generate UUID v4",
    "使用加密安全随机数生成 UUID；输入为生成数量。",
    "Developer",
    { count: { type: "integer", minimum: 1, maximum: 100 } },
    "array",
    { count: 1 },
    (i) => Array.from({ length: num(i, "count") }, () => crypto.randomUUID()),
  ),
  d(
    "hash.sha256",
    "SHA-256",
    "SHA-256 digest",
    "计算 UTF-8 文本 SHA-256，不适用于密码存储。",
    "Hash",
    { text: s },
    "string",
    { text: "abc" },
    async (i) =>
      bytesHex(
        new Uint8Array(
          await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(text(i)),
          ),
        ),
      ),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  ),
  d(
    "hash.sha384",
    "SHA-384",
    "SHA-384 digest",
    "计算 UTF-8 文本 SHA-384。",
    "Hash",
    { text: s },
    "string",
    { text: "abc" },
    async (i) =>
      bytesHex(
        new Uint8Array(
          await crypto.subtle.digest(
            "SHA-384",
            new TextEncoder().encode(text(i)),
          ),
        ),
      ),
    "cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7",
  ),
  d(
    "hash.sha512",
    "SHA-512",
    "SHA-512 digest",
    "计算 UTF-8 文本 SHA-512。",
    "Hash",
    { text: s },
    "string",
    { text: "abc" },
    async (i) =>
      bytesHex(
        new Uint8Array(
          await crypto.subtle.digest(
            "SHA-512",
            new TextEncoder().encode(text(i)),
          ),
        ),
      ),
    "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f",
  ),
];
