import {
  define as d,
  s,
  text,
  base64Bytes,
  encode64,
  utf8,
  bytesHex,
  fromHex,
} from "./define.ts";
export const encodingActions = [
  d(
    "encoding.base64.encode",
    "Base64 编码",
    "Base64 encode",
    "UTF-8 文本编码为标准 Base64。",
    "Encoding",
    { text: s },
    "string",
    { text: "你好" },
    (i) => encode64(new TextEncoder().encode(text(i))),
    "5L2g5aW9",
  ),
  d(
    "encoding.base64.decode",
    "Base64 解码",
    "Base64 decode",
    "校验 Base64 并严格解码为 UTF-8。",
    "Encoding",
    { text: s },
    "string",
    { text: "5L2g5aW9" },
    (i) => utf8(base64Bytes(text(i))),
    "你好",
  ),
  d(
    "encoding.hex.encode",
    "十六进制编码",
    "UTF-8 to hex",
    "将 UTF-8 字节编码为十六进制。",
    "Encoding",
    { text: s },
    "string",
    { text: "LR" },
    (i) => bytesHex(new TextEncoder().encode(text(i))),
    "4c52",
  ),
  d(
    "encoding.hex.decode",
    "十六进制解码",
    "Hex to UTF-8",
    "校验十六进制并严格解码 UTF-8。",
    "Encoding",
    { text: s },
    "string",
    { text: "4c52" },
    (i) => utf8(fromHex(text(i))),
    "LR",
  ),
  d(
    "encoding.uri.encode",
    "URL 组件编码",
    "URI component encode",
    "转义 URL 查询参数中的保留字符。",
    "Encoding",
    { text: s },
    "string",
    { text: "你好 &" },
    (i) => encodeURIComponent(text(i)),
    "%E4%BD%A0%E5%A5%BD%20%26",
  ),
  d(
    "encoding.uri.decode",
    "URL 组件解码",
    "URI component decode",
    "解码百分号编码，不把加号转换为空格。",
    "Encoding",
    { text: s },
    "string",
    { text: "%E4%BD%A0%E5%A5%BD" },
    (i) => decodeURIComponent(text(i)),
    "你好",
  ),
  d(
    "encoding.binary.encode",
    "UTF-8 二进制",
    "UTF-8 to binary",
    "将每个 UTF-8 字节编码为八位二进制。",
    "Encoding",
    { text: s },
    "string",
    { text: "A" },
    (i) =>
      Array.from(new TextEncoder().encode(text(i)), (b) =>
        b.toString(2).padStart(8, "0"),
      ).join(" "),
    "01000001",
  ),
  d(
    "encoding.binary.decode",
    "二进制解码",
    "Binary to UTF-8",
    "严格解码空格分隔的八位二进制字节。",
    "Encoding",
    { text: s },
    "string",
    { text: "01000001" },
    (i) => {
      const v = text(i).trim();
      if (!/^[01]{8}(?:\s+[01]{8})*$/.test(v))
        throw Error("Expected 8-bit binary groups");
      return utf8(Uint8Array.from(v.split(/\s+/), (x) => parseInt(x, 2)));
    },
    "A",
  ),
  d(
    "encoding.codepoints",
    "Unicode 码点",
    "Unicode code points",
    "读取 Unicode 码点，包括 Emoji。",
    "Encoding",
    { text: s },
    "array",
    { text: "LR" },
    (i) =>
      [...text(i)].map(
        (c) =>
          "U+" + c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0"),
      ),
    ["U+004C", "U+0052"],
  ),
  d(
    "developer.jwt.inspect",
    "JWT 查看",
    "Inspect JWT",
    "解码 JWT 头与载荷；不验证签名或可信性。",
    "Developer",
    { text: s },
    "object",
    { text: "eyJhbGciOiJub25lIn0.eyJzdWIiOiJMUiJ9." },
    (i) => {
      const parts = text(i).split(".");
      if (parts.length !== 3) throw Error("JWT must have three parts");
      const decode = (v: string) => {
        v = v.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(
          utf8(base64Bytes(v + "=".repeat((4 - (v.length % 4)) % 4))),
        );
      };
      return {
        header: decode(parts[0]),
        payload: decode(parts[1]),
        signatureVerified: false,
      };
    },
  ),
];
