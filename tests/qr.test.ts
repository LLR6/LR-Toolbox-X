import { test } from "node:test";
import assert from "node:assert/strict";
import jsQR from "jsqr";
import { execute, AppError } from "../packages/registry/src/index.ts";
function raster(svg: string) {
  const side = Number(/viewBox="0 0 (\d+) \d+"/.exec(svg)![1]),
    scale = 6,
    size = side * scale;
  const pixels = new Uint8ClampedArray(size * size * 4).fill(255);
  for (const match of svg.matchAll(/M(\d+) (\d+)h(\d+)v1H\d+z/g)) {
    const [x, y, width] = match.slice(1).map(Number);
    for (let row = y * scale; row < (y + 1) * scale; row++)
      for (let col = x * scale; col < (x + width) * scale; col++) {
        const at = (row * size + col) * 4;
        pixels[at] = pixels[at + 1] = pixels[at + 2] = 0;
      }
  }
  return { pixels, size };
}
for (const correction of ["L", "M", "Q", "H"])
  test(`QR SVG independently decodes Unicode and punctuation (${correction})`, async () => {
    const text =
      '中文🧪 / <script>alert("LR")</script> & https://example.com?q=你好';
    const svg = (await execute("qr.generate", { text, correction })) as string;
    assert.ok(!svg.includes("<script>"));
    const { pixels, size } = raster(svg);
    assert.equal(jsQR(pixels, size, size)?.data, text);
  });
test("QR input bounds are measured in UTF-8 bytes", async () => {
  assert.ok(
    (
      (await execute("qr.generate", {
        text: "a".repeat(1000),
        correction: "H",
      })) as string
    ).startsWith("<svg"),
  );
  for (const text of ["", "中".repeat(334), "a".repeat(1001)])
    await assert.rejects(
      () => execute("qr.generate", { text, correction: "H" }),
      AppError,
    );
});
