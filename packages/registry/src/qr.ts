import qrcode from "qrcode-generator";
import { define as d, text } from "./define.ts";
// The upstream default truncates characters to 8 bits. Encode byte segments as UTF-8.
qrcode.stringToBytes = (value) => Array.from(new TextEncoder().encode(value));
export function qrMatrix(value: string, level: "L" | "M" | "Q" | "H") {
  const bytes = new TextEncoder().encode(value).length;
  if (!bytes || bytes > 1000)
    throw Error("QR content must contain 1–1000 UTF-8 bytes");
  const code = qrcode(0, level);
  code.addData(value, "Byte");
  code.make();
  return code;
}
export const qrActions = [
  d(
    "qr.generate",
    "二维码生成",
    "Generate QR code",
    "离线生成 UTF-8 二维码，可预览、下载 SVG 或 PNG；内容最多 1000 字节。",
    "QR",
    {
      text: { title: "文字或链接", type: "string", maxLength: 1000 },
      correction: {
        title: "纠错等级",
        type: "string",
        enum: ["L", "M", "Q", "H"],
      },
    },
    "string",
    { text: "https://example.com/你好", correction: "M" },
    (i) => {
      const code = qrMatrix(
          text(i),
          text(i, "correction") as "L" | "M" | "Q" | "H",
        ),
        count = code.getModuleCount(),
        paths: string[] = [];
      for (let y = 0; y < count; y++) {
        let x = 0;
        while (x < count) {
          if (!code.isDark(y, x)) {
            x++;
            continue;
          }
          const start = x;
          while (x < count && code.isDark(y, x)) x++;
          paths.push(`M${start + 4} ${y + 4}h${x - start}v1H${start + 4}z`);
        }
      }
      const size = count + 8;
      // Only integer geometry is interpolated; input text never enters SVG markup.
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size * 8}" height="${size * 8}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="white"/><path d="${paths.join("")}" fill="black"/></svg>`;
    },
  ),
];
