import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import { zipSync, strToU8 } from "fflate";
import { mediaFixture } from "./media-fixture.ts";
async function picture(page: Page) {
  const data = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 300;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#fff";
    c.fillRect(0, 0, 1000, 300);
    c.fillStyle = "#000";
    c.font = "bold 80px Arial";
    c.fillText("HELLO 2026", 40, 170);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  return {
    name: "hello.png",
    mimeType: "image/png",
    buffer: Buffer.from(data, "base64"),
  };
}
async function open(page: Page, id: string) {
  await page.goto("/");
  await page.getByTestId("studio-" + id).click();
}
test("discovery introduces seven studios and recommends only three tools at a time", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".studio-card")).toHaveCount(7);
  await expect(page.locator(".recommended-tools article")).toHaveCount(3);
  await expect(page.locator(".sidebar details")).not.toHaveAttribute(
    "open",
    "",
  );
  await page.getByRole("button", { name: "编程与开发", exact: true }).click();
  await expect(page.getByTestId("dashboard-json.format")).toBeVisible();
  await page.getByTestId("studio-sql").click();
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("status")).toContainText("SELECT");
});
test("mobile introduction has readable text in dark/light themes and no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const mode of ["dark", "light"]) {
    if (mode === "light") await page.getByTitle("Switch theme").click();
    const values = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      return {
        text: s.getPropertyValue("--muted").trim(),
        bg: s.getPropertyValue("--panel").trim(),
        width: document.documentElement.scrollWidth,
      };
    });
    function luminance(hex: string) {
      if (hex.length === 4)
        hex = "#" + [...hex.slice(1)].map((c) => c + c).join("");
      const c = hex
        .slice(1)
        .match(/../g)!
        .map((n) => parseInt(n, 16) / 255)
        .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4));
      return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
    }
    const a = luminance(values.text),
      b = luminance(values.bg);
    expect(
      (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
    ).toBeGreaterThanOrEqual(4.5);
    expect(values.width).toBeLessThanOrEqual(390);
  }
  await page.getByTestId("studio-pdf").click();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
test("PDF studio merges actual files and extracts selected pages", async ({
  page,
}) => {
  await open(page, "pdf");
  const doc = await PDFDocument.create();
  doc.addPage();
  doc.addPage();
  const data = Buffer.from(await doc.save());
  await page.locator("input[type=file]").setInputFiles([
    { name: "first.pdf", mimeType: "application/pdf", buffer: data },
    { name: "second.pdf", mimeType: "application/pdf", buffer: data },
  ]);
  await page.getByRole("button", { name: "开始处理", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("处理完成");
  let pending = page.waitForEvent("download");
  await page.getByRole("button", { name: /下载 \/ Download/ }).click();
  let file = await pending;
  expect(
    (
      await PDFDocument.load(await readFile((await file.path())!))
    ).getPageCount(),
  ).toBe(4);
  await page.locator("input[type=file]").setInputFiles({
    name: "source.pdf",
    mimeType: "application/pdf",
    buffer: data,
  });
  await page.getByLabel("PDF operation").selectOption("extract");
  await page.getByLabel("PDF pages").fill("2");
  await page.getByRole("button", { name: "开始处理", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("处理完成");
  pending = page.waitForEvent("download");
  await page.getByRole("button", { name: /下载 \/ Download/ }).click();
  file = await pending;
  expect(
    (
      await PDFDocument.load(await readFile((await file.path())!))
    ).getPageCount(),
  ).toBe(1);
});
test("compressor exports real JPEG and cropper exports an image selection", async ({
  page,
}) => {
  await open(page, "compress");
  const image = await picture(page);
  await page.locator("input[type=file]").setInputFiles(image);
  await page.getByRole("button", { name: "开始处理", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("处理完成");
  let pending = page.waitForEvent("download");
  await page.getByRole("button", { name: /下载 \/ Download/ }).click();
  let file = await pending;
  const jpeg = await readFile((await file.path())!);
  expect([...jpeg.subarray(0, 2)]).toEqual([255, 216]);
  await page.getByRole("button", { name: "Close tool" }).click();
  await page.getByTestId("studio-crop").click();
  await page.locator("input[type=file]").setInputFiles(image);
  await expect(page.locator("cropper-selection")).toBeVisible();
  await page.getByLabel("Crop aspect ratio").selectOption("1");
  await page.getByRole("button", { name: "开始处理", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("处理完成");
  pending = page.waitForEvent("download");
  await page.getByRole("button", { name: /下载 \/ Download/ }).click();
  file = await pending;
  expect([...(await readFile((await file.path())!)).subarray(0, 8)]).toEqual([
    137, 80, 78, 71, 13, 10, 26, 10,
  ]);
});
test("OCR recognizes generated printed text with same-origin worker/models", async ({
  page,
}) => {
  test.setTimeout(90000);
  await open(page, "ocr");
  await page.locator("input[type=file]").setInputFiles(await picture(page));
  await page.locator(".studio-options select").selectOption("eng");
  await page.getByRole("button", { name: "开始处理", exact: true }).click();
  await expect(page.getByLabel("可编辑正文")).toHaveValue(/HELLO\s+2026/, {
    timeout: 60000,
  });
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载 TXT", exact: true }).click();
  const file = await pending;
  expect(await readFile((await file.path())!, "utf8")).toContain("HELLO");
});
test("Word studio previews structure, strips unsafe links and exports text/images", async ({
  page,
}) => {
  await open(page, "word");
  const image = await picture(page);
  const xml =
    '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body><w:p><w:r><w:t>LR 中文 report</w:t></w:r></w:p><w:p><w:hyperlink r:id="bad"><w:r><w:t>unsafe link</w:t></w:r></w:hyperlink></w:p></w:body></w:document>';
  const docx = zipSync({
    "[Content_Types].xml": strToU8(
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/></Types>',
    ),
    "_rels/.rels": strToU8(
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    ),
    "word/document.xml": strToU8(xml),
    "word/_rels/document.xml.rels": strToU8(
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="bad" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="javascript:alert(1)" TargetMode="External"/></Relationships>',
    ),
    "word/media/image.png": image.buffer,
  });
  await page.locator("input[type=file]").setInputFiles({
    name: "report.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: Buffer.from(docx),
  });
  await page.getByRole("button", { name: "开始处理", exact: true }).click();
  await expect(page.getByLabel("可编辑正文")).toHaveValue(/LR 中文 report/);
  const frame = page.frameLocator("iframe");
  await expect(frame.getByText("LR 中文 report")).toBeVisible();
  await expect(frame.locator("[href],script")).toHaveCount(0);
  await expect(page.locator("iframe")).toHaveAttribute("sandbox", "");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载 HTML", exact: true }).click();
  const file = await pending;
  expect(await readFile((await file.path())!, "utf8")).toContain(
    "Content-Security-Policy",
  );
});
test("media studio extracts MP3, transcodes MP4 and makes GIF using the pinned engine", async ({
  page,
}) => {
  test.setTimeout(180000);
  // Exact registry-distributed core bytes are served locally for deterministic CI; production uses the same pinned CDN assets.
  await page.route(
    "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/*",
    async (route) => {
      const name = new URL(route.request().url()).pathname.split("/").pop()!;
      await route.fulfill({
        path: "node_modules/@ffmpeg/core/dist/esm/" + name,
        contentType: name.endsWith(".wasm")
          ? "application/wasm"
          : "text/javascript",
        headers: { "access-control-allow-origin": "*" },
      });
    },
  );
  await open(page, "media");
  await page.locator("input[type=file]").setInputFiles({
    name: "sample.mp4",
    mimeType: "video/mp4",
    buffer: mediaFixture,
  });
  await page.getByLabel("Media duration").fill("1");
  for (const [mode, extension] of [
    ["audio", "mp3"],
    ["mp4", "mp4"],
    ["gif", "gif"],
  ]) {
    await page.getByLabel("Media operation").selectOption(mode);
    await page.getByRole("button", { name: "开始处理", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("处理完成", {
      timeout: 90000,
    });
    const pending = page.waitForEvent("download");
    await page.getByRole("button", { name: /下载 \/ Download/ }).click();
    const file = await pending;
    expect(file.suggestedFilename()).toBe("output." + extension);
    const bytes = await readFile((await file.path())!);
    expect(bytes.length).toBeGreaterThan(100);
    if (mode === "gif") expect(bytes.subarray(0, 3).toString()).toBe("GIF");
    if (mode === "mp4") expect(bytes.subarray(4, 8).toString()).toBe("ftyp");
  }
});
