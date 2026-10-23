import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("mobile diff workspace shows additions/deletions and switches to source", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByTestId("dashboard-text.diff").click();
  await page
    .getByRole("textbox", { name: "before", exact: true })
    .fill("你好\n旧内容\n");
  await page
    .getByRole("textbox", { name: "after", exact: true })
    .fill("你好\n新内容🧪\n");
  await page.getByRole("combobox", { name: "mode" }).selectOption("lines");
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.locator('[data-change="added"]')).toHaveText("新内容🧪\n");
  await expect(page.locator('[data-change="removed"]')).toHaveText("旧内容\n");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.getByRole("button", { name: "源码", exact: true }).click();
  await expect(page.getByRole("status")).toContainText('"kind": "diff"');
});
test("YAML conversion exports JSON and rejects duplicate keys", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByTestId("dashboard-yaml.to.json").click();
  const input = page.getByRole("textbox", { name: "text", exact: true });
  await input.fill('name: 中文🧪\ncode: "001"');
  await page.getByRole("button", { name: "运行工具" }).click();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载", exact: true }).click();
  const file = await pending;
  expect(file.suggestedFilename()).toBe("yaml.to.json.json");
  expect(JSON.parse(await readFile((await file.path())!, "utf8"))).toEqual({
    name: "中文🧪",
    code: "001",
  });
  await input.fill("name: first\nname: duplicate");
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
});
test("Markdown preview is isolated, blocks remote images and exports a safe document", async ({
  page,
}) => {
  const remoteRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("example.org"))
      remoteRequests.push(request.url());
  });
  await page.goto("/");
  await page.getByTestId("dashboard-markdown.render").click();
  await page
    .getByRole("textbox", { name: "text", exact: true })
    .fill(
      "# 文档🧪\n\n| 工具 | 状态 |\n|---|---|\n| LR | OK |\n\n<script>alert(1)</script>\n\n![remote](https://example.org/image.png)",
    );
  await page.getByRole("button", { name: "运行工具" }).click();
  const frame = page.frameLocator('iframe[title="Markdown 排版预览"]');
  await expect(frame.getByRole("heading", { name: "文档🧪" })).toBeVisible();
  await expect(frame.getByRole("table")).toContainText("OK");
  await expect(page.locator("iframe")).toHaveAttribute("sandbox", "");
  await expect(frame.locator("script, img")).toHaveCount(0);
  expect(remoteRequests).toEqual([]);
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载", exact: true }).click();
  const file = await pending;
  expect(file.suggestedFilename()).toBe("markdown.render.html");
  const html = await readFile((await file.path())!, "utf8");
  expect(html).toContain('http-equiv="Content-Security-Policy"');
  expect(html).toContain("&lt;script&gt;");
});
