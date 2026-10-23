import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function open(page: Page, id: string) {
  await page.goto("/");
  await page.getByTestId(`studio-${id}`).click();
}

async function generatedPng(page: Page) {
  const base64 = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 360;
    canvas.height = 240;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#5368c7";
    ctx.fillRect(0, 0, 180, 240);
    ctx.fillStyle = "#e18ed3";
    ctx.fillRect(180, 0, 180, 120);
    ctx.fillStyle = "#54d6ab";
    ctx.fillRect(180, 120, 180, 120);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  return {
    name: "palette.png",
    mimeType: "image/png",
    buffer: Buffer.from(base64, "base64"),
  };
}

test("Mermaid canvas renders a real diagram and exports SVG", async ({ page }) => {
  await open(page, "mermaid");
  await expect(page.locator(".mermaid-canvas svg")).toBeVisible({ timeout: 30000 });
  await page.getByLabel("Mermaid source").fill("flowchart TD\nA[LR] --> B[Toolbox]");
  await page.getByRole("button", { name: "重新渲染", exact: true }).click();
  await expect(page.locator(".mermaid-canvas")).toContainText("Toolbox");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载 SVG", exact: true }).click();
  const file = await pending;
  const svg = await readFile((await file.path())!, "utf8");
  expect(svg).toContain("<svg");
  expect(svg).toContain("Toolbox");
});

test("spreadsheet studio parses CSV locally and exports JSON", async ({ page }) => {
  await open(page, "sheet");
  await page.locator('input[type="file"]').setInputFiles({
    name: "scores.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("name,value\nLR,42\nToolbox,10\n"),
  });
  await expect(page.locator(".sheet-scroll")).toContainText("LR");
  await expect(page.locator(".sheet-scroll")).toContainText("42");
  const pending = page.waitForEvent("download");
  await page.locator(".visual-actions").getByRole("button", { name: "JSON", exact: true }).click();
  const file = await pending;
  const data = JSON.parse(await readFile((await file.path())!, "utf8"));
  expect(data[0]).toEqual({ name: "LR", value: 42 });
});

test("SVG lab optimizes source and exports sanitized SVG", async ({ page }) => {
  await open(page, "svg");
  await expect(page.locator(".svg-preview svg")).toBeVisible({ timeout: 20000 });
  await page.getByLabel("SVG source").fill(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="0" y="0" width="100" height="100" fill="#5368c7" /></svg>',
  );
  await page.getByRole("button", { name: "运行 SVGO", exact: true }).click();
  await expect(page.locator(".svg-output")).toContainText("<path");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载优化 SVG", exact: true }).click();
  const file = await pending;
  expect(await readFile((await file.path())!, "utf8")).toContain("<svg");
});

test("photo metadata and palette studios process a local image", async ({ page }) => {
  const image = await (async () => {
    await page.goto("/");
    return generatedPng(page);
  })();
  await page.getByTestId("studio-exif").click();
  await page.locator('input[type="file"]').setInputFiles(image);
  await expect(page.getByRole("status")).toContainText("处理完成");
  await expect(page.locator(".metadata-panel")).toBeVisible();
  await page.getByRole("button", { name: "Close studio" }).click();
  await page.getByTestId("studio-palette").click();
  await page.locator('input[type="file"]').setInputFiles(image);
  await expect(page.locator(".swatch-grid button")).toHaveCount(8, { timeout: 20000 });
  const pending = page.waitForEvent("download");
  await page.locator(".visual-actions").getByRole("button", { name: "CSS", exact: true }).click();
  const file = await pending;
  expect(await readFile((await file.path())!, "utf8")).toContain("--image-color-1");
});

test("Cron planner calculates ten future executions", async ({ page }) => {
  await open(page, "cron");
  await page.getByRole("button", { name: "工作日", exact: true }).click();
  await page.getByRole("button", { name: "计算未来执行时间", exact: true }).click();
  await expect(page.locator(".cron-timeline li")).toHaveCount(10);
  await expect(page.locator(".cron-timeline")).toContainText("T");
});

test("password lab scores locally without network lookup", async ({ page }) => {
  await open(page, "password");
  await page.getByLabel("待分析密码").fill("LR-Toolbox-2026-correct-horse-battery");
  await page.getByRole("button", { name: "分析强度", exact: true }).click();
  await expect(page.locator(".score-orb")).toBeVisible({ timeout: 20000 });
  await expect(page.locator(".score-panel")).toContainText("估算破解时间");
  await expect(page.getByRole("status")).toContainText("处理完成");
});

test("HTML snapshot renders a real PNG after sanitizing the card", async ({ page }) => {
  await open(page, "snapshot");
  await page.locator(".snapshot-editor label").filter({ hasText: "HTML" }).locator("textarea").fill(
    '<div class="card"><h1>LR Snapshot</h1><script>window.__bad=1</script></div>',
  );
  await page.getByRole("button", { name: "渲染并导出 PNG", exact: true }).click();
  await expect(page.locator(".snapshot-result img")).toBeVisible({ timeout: 20000 });
  expect(await page.evaluate(() => (window as unknown as { __bad?: number }).__bad)).toBeUndefined();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载 PNG", exact: true }).click();
  const file = await pending;
  const bytes = await readFile((await file.path())!);
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
});

test("date/time studio converts between timezones and HEIC studio loads its engine UI", async ({ page }) => {
  await open(page, "datetime");
  await page.getByLabel("来源时区").fill("UTC");
  await page.getByLabel("目标时区").fill("Asia/Shanghai");
  await page.getByRole("button", { name: "建立时间线", exact: true }).click();
  await expect(page.locator(".time-results")).toContainText("ISO 8601");
  await expect(page.locator(".time-results")).toContainText("Asia/Shanghai");
  await page.getByRole("button", { name: "Close studio" }).click();
  await page.getByTestId("studio-heic").click();
  await expect(page.getByText("HEIC → JPG / PNG", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "开始转换", exact: true })).toBeDisabled();
});
