import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function open(page: Page, id: string) {
  await page.goto("/");
  await page.getByTestId(`studio-${id}`).click();
}

test("ECharts studio renders data and exports a real PNG", async ({ page }) => {
  await open(page, "charts");
  await page.getByLabel("Chart data").fill('[{"name":"A","value":12},{"name":"B","value":21}]');
  await page.getByRole("button", { name: "生成图表", exact: true }).click();
  await expect(page.locator(".chart-host canvas")).toBeVisible({ timeout: 30000 });
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNG", exact: true }).click();
  const file = await pending;
  const bytes = await readFile((await file.path())!);
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
});

test("Math studio evaluates expressions locally", async ({ page }) => {
  await open(page, "math");
  await page.getByLabel("Math expression").fill("2 + 3 * 4");
  await page.getByRole("button", { name: "计算", exact: true }).click();
  await expect(page.locator(".metric-card strong")).toHaveText("14");
  await expect(page.getByRole("status")).toContainText("计算完成");
});

test("barcode studio generates SVG with real bars", async ({ page }) => {
  await open(page, "barcode");
  await page.getByLabel("Barcode content").fill("LR-2026-42");
  await page.getByRole("button", { name: "生成", exact: true }).click();
  await expect(page.locator(".barcode-preview svg rect").first()).toBeVisible();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "SVG", exact: true }).click();
  const file = await pending;
  expect(await readFile((await file.path())!, "utf8")).toContain("<svg");
});

test("JWT studio decodes without pretending an unsigned token is verified", async ({ page }) => {
  await open(page, "jwt");
  await page.getByLabel("JWT token").fill("eyJhbGciOiJub25lIn0.eyJzdWIiOiJMUiIsInJvbGUiOiJ0b29sYm94In0.");
  await page.getByRole("button", { name: "解析 / 验证", exact: true }).click();
  await expect(page.locator(".code-card").nth(1)).toContainText('"sub": "LR"');
  await expect(page.locator(".verify-ok")).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("未输入密钥");
});

test("JSONata studio performs a real JSON transformation", async ({ page }) => {
  await open(page, "jsonata");
  await page.getByLabel("JSONata input").fill('{"values":[4,7,13]}');
  await page.getByLabel("JSONata expression").fill("$sum(values)");
  await page.getByRole("button", { name: "运行转换", exact: true }).click();
  await expect(page.locator(".big-pre")).toHaveText("24");
});

test("Handlebars studio renders data and sanitizes preview", async ({ page }) => {
  await open(page, "template");
  await page.getByLabel("Template source").fill("<h1>{{name}}</h1><script>window.__bad=1</script>");
  await page.getByLabel("Template data").fill('{"name":"LR"}');
  await page.getByRole("button", { name: "渲染模板", exact: true }).click();
  await expect(page.locator(".template-preview h1")).toHaveText("LR");
  expect(await page.evaluate(() => (window as unknown as { __bad?: number }).__bad)).toBeUndefined();
});

test("Reveal studio builds a multi-slide deck", async ({ page }) => {
  await open(page, "slides");
  await page.getByLabel("Slide source").fill("# One\nHello\n\n---\n\n# Two\nWorld\n\n---\n\n# Three");
  await page.getByRole("button", { name: "生成演示", exact: true }).click();
  await expect(page.locator(".slides section")).toHaveCount(3, { timeout: 30000 });
  await expect(page.locator(".slides-shell")).toContainText("One");
});

test("SQLite studio runs a real in-browser database query and exports bytes", async ({ page }) => {
  await open(page, "sqlite");
  await page.getByLabel("SQLite query").fill("CREATE TABLE t(name TEXT, n INTEGER); INSERT INTO t VALUES ('LR', 42), ('X', 7); SELECT * FROM t ORDER BY n DESC;");
  await page.getByRole("button", { name: "执行 SQL", exact: true }).click();
  await expect(page.locator(".table-scroll tbody tr")).toHaveCount(2, { timeout: 30000 });
  await expect(page.locator(".table-scroll")).toContainText("LR");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出数据库", exact: true }).click();
  const file = await pending;
  const bytes = await readFile((await file.path())!);
  expect(bytes.subarray(0, 16).toString("utf8")).toContain("SQLite format 3");
});
