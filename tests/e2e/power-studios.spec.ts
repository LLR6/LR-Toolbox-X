import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function open(page: Page, id: string) {
  await page.goto("/");
  await page.getByTestId(`studio-${id}`).click();
  await expect(page.locator(`.power-${id}`)).toBeVisible();
}

test("Quicktype generates a real TypeScript model from JSON", async ({ page }) => {
  await open(page, "quicktype");
  await page.getByLabel("Quicktype JSON source").fill('{"student":{"name":"LR","score":408},"passed":true}');
  await page.getByLabel("Target language").selectOption("typescript");
  await page.getByRole("button", { name: /生成模型|Generate model/ }).click();
  await expect(page.getByTestId("quicktype-output")).toContainText("student", { timeout: 30000 });
  await expect(page.getByTestId("quicktype-output")).toContainText("number");
});

test("ECharts renders local CSV and exports a real PNG", async ({ page }) => {
  await open(page, "charts");
  await page.getByLabel("Chart data source").fill("name,value\nA,10\nB,24\nC,18");
  await page.getByLabel("Chart type").selectOption("line");
  await page.getByRole("button", { name: /生成图表|Render chart/ }).click();
  await expect(page.getByTestId("chart-host").locator("canvas")).toBeVisible({ timeout: 30000 });
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNG ↓", exact: true }).click();
  const file = await pending;
  const bytes = await readFile((await file.path())!);
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
});

test("Math.js evaluates expressions and matrix determinant locally", async ({ page }) => {
  await open(page, "math");
  await page.getByLabel("Math expression").fill("sqrt(81) + 3^2");
  await page.getByRole("button", { name: /计算|Evaluate/ }).click();
  await expect(page.getByTestId("math-result")).toHaveText("18", { timeout: 20000 });
  await page.getByLabel("Matrix JSON").fill("[[1,2],[3,4]]");
  await page.getByRole("button", { name: "det(A)", exact: true }).click();
  await expect(page.locator(".matrix-result")).toContainText("-2");
});

test("KaTeX typesets a formula and exports a PNG", async ({ page }) => {
  await open(page, "latex");
  await page.getByLabel("LaTeX source").fill(String.raw`E = mc^2`);
  await page.getByRole("button", { name: /排版公式|Render formula/ }).click();
  await expect(page.getByTestId("formula-host").locator(".katex")).toBeVisible({ timeout: 20000 });
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNG ↓", exact: true }).click();
  const file = await pending;
  const bytes = await readFile((await file.path())!);
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
});

test("Lottie renders the bundled local animation and exposes controls", async ({ page }) => {
  await open(page, "lottie");
  await page.getByRole("button", { name: /加载动画|Load animation/ }).click();
  await expect(page.getByTestId("lottie-stage").locator("svg")).toBeVisible({ timeout: 30000 });
  await page.getByLabel("Lottie speed").selectOption("2");
  await page.getByRole("button", { name: /暂停|Pause/ }).click();
  await page.getByRole("button", { name: /播放|Play/ }).click();
});

test("barcode studio generates Code 128 and decodes the generated image", async ({ page }) => {
  await open(page, "barcode");
  await page.getByLabel("Barcode content").fill("LRTOOLBOX2026");
  await page.getByLabel("Barcode type").selectOption("code128");
  await page.getByRole("button", { name: /生成条码|Generate barcode/ }).click();
  const canvas = page.getByTestId("barcode-canvas");
  await expect(canvas).toBeVisible({ timeout: 20000 });
  const png = await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL("image/png").split(",")[1]);
  await page.getByLabel("Barcode image").setInputFiles({ name: "barcode.png", mimeType: "image/png", buffer: Buffer.from(png, "base64") });
  await expect(page.getByTestId("scan-result")).toHaveText("LRTOOLBOX2026", { timeout: 30000 });
});
