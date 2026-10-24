import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
async function open(page: Page) {
  await page.goto("/");
  await page
    .getByRole("textbox", { name: "搜索工具", exact: true })
    .fill("CyberChef");
  await page
    .getByRole("textbox", { name: "搜索工具", exact: true })
    .press("Enter");
  await expect(
    page.getByRole("region", { name: "CyberChef Suite" }),
  ).toBeVisible();
}
test("suite exposes the deduplicated upstream directory without loading its heavy engine early", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await open(page);
  await expect(page.locator(".chef-operation-list > button")).toHaveCount(504);
  expect(
    requests.some((x) => x.includes("/engines/cyberchef/assets/main.js")),
  ).toBe(false);
  await page.getByLabel("搜索 CyberChef 操作").fill("X.509");
  await expect(page.locator(".chef-operation-list")).toContainText(
    "Parse X.509 certificate",
  );
  await page.getByLabel("搜索 CyberChef 操作").fill("");
  await page.getByLabel("CyberChef 分类").selectOption("Compression");
  await expect(page.locator(".chef-operation-list")).toContainText("Gunzip");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载完整操作目录 JSON ↓" }).click();
  const file = await pending;
  const items = JSON.parse(await readFile((await file.path())!, "utf8"));
  expect(items).toHaveLength(504);
  expect(new Set(items.map((x: { name: string }) => x.name)).size).toBe(504);
});
test("self-hosted upstream workbench executes real Base64, SHA-256 and URL recipes", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await open(page);
  const frame = page.frameLocator('iframe[title="CyberChef local workbench"]');
  await page
    .getByRole("button", { name: "Base64 编码 →", exact: true })
    .click();
  const input = frame.locator("#input .cm-content");
  const output = frame.locator("#output .cm-content");
  await input.fill("Hello LR");
  await expect(output).toContainText("SGVsbG8gTFI=");
  await page
    .getByRole("button", { name: "SHA-256 摘要 →", exact: true })
    .click();
  await input.fill("abc");
  await expect(output).toContainText(
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
  await page.getByRole("button", { name: "URL 解码 →", exact: true }).click();
  await input.fill("LR%20%2B%20%E4%B8%AD%E6%96%87");
  await expect(output).toContainText("LR + 中文");
  const src = await page
    .locator('iframe[title="CyberChef local workbench"]')
    .getAttribute("src");
  expect(src).toMatch(/^\.\/engines\/cyberchef\/index\.html#/);
});
test("suite supports multi-step compression and JSON formatting via the pinned application", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await open(page);
  await page
    .getByRole("button", { name: "打开完整操作台 →", exact: true })
    .click();
  const frame = page.frameLocator('iframe[title="CyberChef local workbench"]');
  await expect(frame.locator("#input .cm-content")).toBeVisible();
  // User-visible source URLs load actual upstream recipes; no evaluated handler substitutes the engine.
  const recipes = [
    {
      steps: [
        { op: "Gzip", args: [] },
        { op: "To Base64", args: [] },
        { op: "From Base64", args: [] },
        { op: "Gunzip", args: [] },
      ],
      input: "LR local compression test 中文",
      expected: "LR local compression test 中文",
    },
    {
      steps: [{ op: "JSON Beautify", args: [] }],
      input: '{"a":1,"b":2}',
      expected: '"a": 1',
    },
  ];
  for (const recipe of recipes) {
    const url = new URL("./engines/cyberchef/index.html", page.url());
    url.hash = "recipe=" + encodeURIComponent(JSON.stringify(recipe.steps));
    const runtime = page
      .frames()
      .find((f) => f.url().includes("/engines/cyberchef/index.html"))!;
    await runtime.goto(url.toString());
    await expect(frame.locator("#rec-list")).toContainText(recipe.steps[0].op);
    await frame.locator("#input .cm-content").fill(recipe.input);
    await expect(frame.locator("#output .cm-content")).toContainText(
      recipe.expected,
    );
  }
});
