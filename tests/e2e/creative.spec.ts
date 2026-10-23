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
test("discovery exposes twenty-seven studios and recommends only three tools at a time", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".studio-card")).toHaveCount(27);
  await expect(page.locator(".recommended-tools article")).toHaveCount(3);
  await expect(page.locator(".sidebar details")).not.toHaveAttribute(
    "open",
    "",
  );
  await page.getByRole("button", { name: "编程与开发", exact: true }).click();
  await expect(
    page.locator(".recommended-tools").getByTestId("dashboard-json.format"),
  ).toBeVisible();
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
});
test("PDF studio merges actual files and extracts selected pages", async ({ page }) => {
  const makePdf = async (count: number, label: string) => {
    const pdf = await PDFDocument.create();
    for (let i = 0; i < count; i++) {
      const p = pdf.addPage([300, 200]);
      p.drawText(`${label}-${i + 1}`, { x: 20, y: 160, size: 20 });
    }
    return Buffer.from(await pdf.save());
  };
  await open(page, "pdf");
  await page.locator('input[type="file"]').setInputFiles([
    { name: "a.pdf", mimeType: "application/pdf", buffer: await makePdf(2, "A") },
    { name: "b.pdf", mimeType: "application/pdf", buffer: await makePdf(1, "B") },
  ]);
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("status")).toContainText("3 页");
  let pending = page.waitForEvent("download");
  await page.getByRole("button", { name: /下载/ }).click();
  let file = await pending;
  let pdf = await PDFDocument.load(await readFile((await file.path())!));
  expect(pdf.getPageCount()).toBe(3);
  await page.getByLabel("操作").selectOption("extract");
  await page.getByLabel("页码").fill("2-3");
  await page.getByRole("button", { name: "运行工具" }).click();
  pending = page.waitForEvent("download");
  await page.getByRole("button", { name: /下载/ }).click();
  file = await pending;
  pdf = await PDFDocument.load(await readFile((await file.path())!));
  expect(pdf.getPageCount()).toBe(2);
});
test("compressor exports real JPEG and cropper exports an image selection", async ({ page }) => {
  const image = await picture(page);
  await open(page, "compress");
  await page.locator('input[type="file"]').setInputFiles(image);
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("status")).toContainText("处理完成");
  let pending = page.waitForEvent("download");
  await page.getByRole("button", { name: /下载/ }).click();
  let file = await pending;
  let bytes = await readFile((await file.path())!);
  expect([...bytes.subarray(0, 3)]).toEqual([255, 216, 255]);
  await page.getByRole("button", { name: "Close studio" }).click();
  await page.getByTestId("studio-crop").click();
  await page.locator('input[type="file"]').setInputFiles(image);
  await expect(page.locator("cropper-canvas")).toBeVisible({ timeout: 20000 });
  await page.getByRole("button", { name: "运行工具" }).click();
  pending = page.waitForEvent("download");
  await page.getByRole("button", { name: /下载/ }).click();
  file = await pending;
  bytes = await readFile((await file.path())!);
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
});
test("OCR recognizes generated printed text with same-origin worker/models", async ({ page }) => {
  await open(page, "ocr");
  await page.locator('input[type="file"]').setInputFiles(await picture(page));
  await page.getByLabel("语言").selectOption("eng");
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.locator(".studio-text-output")).toContainText("HELLO", {
    timeout: 60000,
  });
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "TXT", exact: true }).click();
  const file = await pending;
  expect(await readFile((await file.path())!, "utf8")).toContain("HELLO");
});
test("Word studio previews structure, strips unsafe links and exports text/images", async ({
  page,
}) => {
  const image = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6O1kAAAAASUVORK5CYII=",
    "base64",
  );
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
  const documentRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/><Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="javascript:alert(1)" TargetMode="External"/></Relationships>`;
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><w:body><w:p><w:r><w:t>LR Word 2026</w:t></w:r></w:p><w:p><w:hyperlink r:id="rId6"><w:r><w:t>unsafe link</w:t></w:r></w:hyperlink></w:p><w:p><w:r><w:drawing><wp:inline><a:graphic><a:graphicData><pic:pic><pic:blipFill><a:blip r:embed="rId5"/></pic:blipFill></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p><w:sectPr/></w:body></w:document>`;
  const docx = Buffer.from(
    zipSync({
      "[Content_Types].xml": strToU8(contentTypes),
      "_rels/.rels": strToU8(rels),
      "word/document.xml": strToU8(document),
      "word/_rels/document.xml.rels": strToU8(documentRels),
      "word/media/image1.png": image,
    }),
  );
  await open(page, "word");
  await page.locator('input[type="file"]').setInputFiles({ name: "sample.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", buffer: docx });
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.locator(".word-preview-frame")).toBeVisible();
  const html = await page.locator(".word-preview-frame").getAttribute("srcdoc");
  expect(html).toContain("LR Word 2026");
  expect(html).not.toContain("javascript:");
  await expect(page.locator(".word-image-list")).toContainText("image1.png");
  let pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "TXT", exact: true }).click();
  let file = await pending;
  expect(await readFile((await file.path())!, "utf8")).toContain("LR Word 2026");
  pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "HTML", exact: true }).click();
  file = await pending;
  const exported = await readFile((await file.path())!, "utf8");
  expect(exported).toContain("Content-Security-Policy");
  expect(exported).not.toContain("javascript:");
});
test("media studio extracts MP3, transcodes MP4 and makes GIF using the pinned engine", async ({ page }) => {
  const fixture = await mediaFixture();
  await open(page, "media");
  await page.locator('input[type="file"]').setInputFiles({ name: "sample.mp4", mimeType: "video/mp4", buffer: fixture });
  for (const mode of ["audio", "video", "gif"] as const) {
    await page.getByLabel("输出").selectOption(mode);
    await page.getByRole("button", { name: "运行工具" }).click();
    await expect(page.getByRole("status")).toContainText("处理完成", { timeout: 90000 });
    const pending = page.waitForEvent("download");
    await page.getByRole("button", { name: /下载/ }).click();
    const file = await pending;
    const bytes = await readFile((await file.path())!);
    if (mode === "audio") expect(bytes.subarray(0, 3).toString("ascii")).toMatch(/ID3|\xff/);
    if (mode === "video") expect(bytes.subarray(4, 8).toString("ascii")).toBe("ftyp");
    if (mode === "gif") expect(bytes.subarray(0, 6).toString("ascii")).toMatch(/^GIF8[79]a$/);
  }
});
