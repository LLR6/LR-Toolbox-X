import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function open(page: Page, id: string) {
  await page.goto("/");
  await page.getByTestId(`studio-${id}`).first().click();
}

async function imageFixture(page: Page) {
  const data = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 420;
    const context = canvas.getContext("2d")!;
    const gradient = context.createLinearGradient(0, 0, 640, 420);
    gradient.addColorStop(0, "#4857d8");
    gradient.addColorStop(0.35, "#a05bd9");
    gradient.addColorStop(0.7, "#43c5b2");
    gradient.addColorStop(1, "#f2a75d");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 640, 420);
    context.fillStyle = "#f7f9ff";
    context.font = "bold 58px Arial";
    context.fillText("LR", 250, 235);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  return {
    name: "palette.png",
    mimeType: "image/png",
    buffer: Buffer.from(data, "base64"),
  };
}

test("new specialist studios are discoverable without replacing the normal toolkit", async ({
  page,
}) => {
  await page.goto("/");
  for (const id of [
    "mermaid",
    "excel",
    "svg",
    "exif",
    "heic",
    "palette",
    "screenshot",
    "cron",
    "password",
    "time",
  ]) {
    await expect(page.getByTestId(`studio-${id}`).first()).toBeVisible();
  }
  await expect(page.locator(".recommended-tools article")).toHaveCount(3);
  await page
    .locator(".sidebar")
    .getByRole("button", { name: /全部工具/ })
    .click();
  await expect(page.getByTestId("action-json.format")).toBeVisible();
});

test("Mermaid studio renders a strict local diagram and exports SVG", async ({
  page,
}) => {
  await open(page, "mermaid");
  await page.getByRole("button", { name: /渲染图表/ }).click();
  await expect(page.getByRole("status")).toContainText("本地渲染");
  const frame = page.frameLocator('iframe[title="Mermaid preview"]');
  await expect(frame.locator("svg")).toBeVisible();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "SVG ↓" }).click();
  const file = await pending;
  expect(file.suggestedFilename()).toBe("LR-diagram.svg");
  expect(await readFile((await file.path())!, "utf8")).toContain("<svg");
});

test("Excel studio parses CSV as a workbook, switches into a table and exports CSV", async ({
  page,
}) => {
  await open(page, "excel");
  await page.getByLabel("Excel file").setInputFiles({
    name: "scores.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("Name,Score\nLR,42\nToolbox,99\n"),
  });
  await expect(page.locator(".spreadsheet-scroll")).toContainText("LR");
  await expect(page.locator(".spreadsheet-scroll")).toContainText("42");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "CSV ↓" }).click();
  const file = await pending;
  expect(await readFile((await file.path())!, "utf8")).toContain("LR,42");
});

test("SVG studio sanitizes, optimizes and downloads a real vector", async ({
  page,
}) => {
  await open(page, "svg");
  await page.getByRole("button", { name: /安全清理并优化/ }).click();
  await expect(page.getByRole("status")).toContainText("优化 SVG");
  const frame = page.frameLocator('iframe[title="SVG optimized preview"]');
  await expect(frame.locator("svg")).toBeVisible();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "SVG ↓" }).click();
  const file = await pending;
  const text = await readFile((await file.path())!, "utf8");
  expect(text).toContain("<svg");
  expect(text).not.toContain("<script");
});

test("photo metadata and palette studios process a generated image locally", async ({
  page,
}) => {
  const image = await imageFixture(page);
  await open(page, "exif");
  await page.getByLabel("Photo metadata file").setInputFiles(image);
  await expect(page.locator(".metadata-grid")).toContainText("palette.png");
  await expect(page.getByRole("status")).toContainText("浏览器本地读取");

  await page.getByRole("button", { name: "Close tool" }).click();
  await page.getByTestId("studio-palette").first().click();
  await page.getByLabel("Palette image").setInputFiles(image);
  await page.getByRole("button", { name: /提取配色/ }).click();
  await expect(page.locator(".swatch-grid button")).toHaveCount(8);
  await expect(page.locator(".palette-wall pre")).toContainText("--lr-primary");
});

test("HTML capture studio creates a real PNG without remote assets", async ({
  page,
}) => {
  await open(page, "screenshot");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: /生成 PNG/ }).click();
  const file = await pending;
  const bytes = await readFile((await file.path())!);
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
});

test("Cron studio validates an expression and lays out ten future executions", async ({
  page,
}) => {
  await open(page, "cron");
  await page.getByRole("button", { name: /验证并生成时间轴/ }).click();
  await expect(page.locator(".cron-timeline li")).toHaveCount(10);
  await expect(page.getByRole("status")).toContainText("后续 10 次");
});

test("password lab analyzes locally without writing password content to history", async ({
  page,
}) => {
  await open(page, "password");
  const secret = "LR-Toolbox-2026!local-only";
  await page.getByLabel("Password to check").fill(secret);
  await page.getByRole("button", { name: /分析弱模式/ }).click();
  await expect(page.locator(".score-orb")).toBeVisible();
  const stored = await page.evaluate(() => localStorage.getItem("lrx.history") ?? "");
  expect(stored).not.toContain(secret);
});

test("world time console converts ISO time and calculates the date difference", async ({
  page,
}) => {
  await open(page, "time");
  await page.getByLabel("Start ISO time").fill("2026-10-23T08:00:00Z");
  await page.getByLabel("Compare ISO time").fill("2026-10-24T20:00:00Z");
  await page.getByRole("button", { name: "计算", exact: true }).click();
  await expect(page.locator(".time-results")).toContainText("2026-10-23T08:00:00.000Z");
  await expect(page.locator(".time-results")).toContainText("1.500");
  await expect(page.locator(".world-clocks article")).toHaveCount(5);
});

test("HEIC studio exposes format and quality controls before a local conversion", async ({
  page,
}) => {
  await open(page, "heic");
  await expect(page.getByLabel("HEIC file")).toBeVisible();
  await expect(page.getByRole("button", { name: /转换图片/ })).toBeDisabled();
  await expect(page.getByText(/不会把原始 EXIF \/ GPS 元数据复制/)).toBeVisible();
});
