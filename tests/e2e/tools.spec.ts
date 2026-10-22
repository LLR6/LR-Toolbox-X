import { test, expect } from "@playwright/test";
test("format JSON, reject invalid input and record history", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "搜索工具" }).fill("json.format");
  await page.getByTestId("action-json.format").click();
  await page
    .getByRole("textbox", { name: "text", exact: true })
    .fill('{"中文":"🧪"}');
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("status")).toContainText("中文");
  await page.getByRole("textbox", { name: "text", exact: true }).fill("{");
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: "Close tool" }).click();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: /执行历史/ })
    .click();
  await expect(page.getByText("json.format").first()).toBeVisible();
});
test("workflow runs shared handlers", async ({ page }) => {
  await page.goto("/");
  await page
    .locator(".sidebar")
    .getByRole("button", { name: /工作流/ })
    .click();
  await page.getByRole("button", { name: /运行工作流/ }).click();
  await expect(page.getByRole("status")).toContainText("SGVsbG8gTFI=");
});
test("workspace imports text, exports output and renders a JSON null result", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByTestId("dashboard-json.format").click();
  await page
    .locator('input[type="file"]')
    .setInputFiles({
      name: "example.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"imported":true}'),
    });
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("status")).toContainText('"imported": true');
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载", exact: true }).click();
  expect((await download).suggestedFilename()).toContain("json.format");
  await page.getByRole("button", { name: "Close tool" }).click();
  await page.getByRole("textbox", { name: "搜索工具" }).fill("json.pointer");
  await page.getByTestId("action-json.pointer").click();
  await page
    .getByRole("textbox", { name: "text", exact: true })
    .fill('{"value":null}');
  await page
    .getByRole("textbox", { name: "pointer", exact: true })
    .fill("/value");
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("status")).toHaveText("null");
  await expect(
    page.getByRole("button", { name: "下载", exact: true }),
  ).toBeEnabled();
});
