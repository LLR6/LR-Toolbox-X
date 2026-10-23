import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function open(page: Page, id: string) {
  await page.goto("/");
  await page.getByTestId(`studio-${id}`).click();
}

test("SQLite studio executes a real in-browser database and exports it", async ({ page }) => {
  await open(page, "sqlite");
  await page.getByLabel("SQLite SQL").fill("CREATE TABLE x(v INTEGER); INSERT INTO x VALUES (7),(11); SELECT SUM(v) AS total FROM x;");
  await page.getByRole("button", { name: "运行数据库", exact: true }).click();
  await expect(page.locator(".sql-result")).toContainText("18", { timeout: 30000 });
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 .sqlite", exact: true }).click();
  const file = await pending;
  const bytes = await readFile((await file.path())!);
  expect(bytes.subarray(0, 16).toString("utf8")).toBe("SQLite format 3\u0000");
});

test("JSON diff studio generates a delta and verifies the patched result", async ({ page }) => {
  await open(page, "jsondiff");
  await page.getByLabel("Before JSON").fill('{"name":"LR","version":10,"items":[1,2]}');
  await page.getByLabel("After JSON").fill('{"name":"LR","version":11,"items":[1,2,3],"local":true}');
  await page.getByRole("button", { name: "生成差异与补丁", exact: true }).click();
  await expect(page.locator(".json-output-grid")).toContainText('"version"');
  await expect(page.locator(".json-output-grid")).toContainText('"local": true');
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载 Delta", exact: true }).click();
  const file = await pending;
  expect(JSON.parse(await readFile((await file.path())!, "utf8"))).toBeTruthy();
});

test("phone studio parses and normalizes an international number locally", async ({ page }) => {
  await open(page, "phone");
  await page.getByLabel("Phone number").fill("+86 138 0013 8000");
  await page.getByLabel("Default country").fill("CN");
  await page.getByRole("button", { name: "解析号码", exact: true }).click();
  await expect(page.locator(".phone-report")).toContainText("+86 138 0013 8000", { timeout: 20000 });
  await expect(page.locator(".phone-report")).toContainText("CN");
  await expect(page.getByRole("status")).toContainText("处理完成");
});

test("natural-language time studio recognizes English and Chinese expressions", async ({ page }) => {
  await open(page, "chrono");
  await page.getByLabel("Natural language date").fill("next Friday at 3:30 pm");
  await page.getByRole("button", { name: "解析时间表达", exact: true }).click();
  await expect(page.locator(".natural-timeline li")).toHaveCount(1, { timeout: 20000 });
  await expect(page.locator(".natural-timeline")).toContainText("next Friday at 3:30 pm");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await page.getByLabel("Natural language date").fill("下周五下午三点");
  await page.getByRole("button", { name: "解析时间表达", exact: true }).click();
  await expect(page.locator(".natural-timeline li")).toHaveCount(1);
});
