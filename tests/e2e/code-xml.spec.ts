import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("formatter loads offline without executing source and downloads JavaScript", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.getByTestId("dashboard-code.format.javascript").click();
  await page
    .getByRole("textbox", { name: "text", exact: true })
    .fill(
      'globalThis.__lrx_executed=true;const value={name:"中文🧪",enabled:true};',
    );
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("status")).toContainText(
    "globalThis.__lrx_executed = true;",
  );
  expect(
    await page.evaluate(() => Object.hasOwn(window, "__lrx_executed")),
  ).toBe(false);
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载", exact: true }).click();
  const file = await pending;
  expect(file.suggestedFilename()).toBe("code.format.javascript.js");
  expect(await readFile((await file.path())!, "utf8")).toContain(
    'name: "中文🧪"',
  );
  await page
    .getByRole("textbox", { name: "text", exact: true })
    .fill("const = ;");
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
});
test("mobile XML structure displays indexed paths and rejects DTD", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByTestId("dashboard-xml.inspect").click();
  await page
    .getByRole("textbox", { name: "text", exact: true })
    .fill('<root><item id="001">中文🧪</item><item id="002"/></root>');
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("table", { name: "XML 元素结构" })).toContainText(
    "/root[1]/item[2]",
  );
  await expect(page.getByRole("table")).toContainText('id="001"');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "源码", exact: true }).click();
  await expect(page.getByRole("status")).toContainText('"elements": 3');
  await page
    .getByRole("textbox", { name: "text", exact: true })
    .fill('<!DOCTYPE root SYSTEM "https://example.org/x.dtd"><root/>');
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("alert")).toContainText("DTD");
});
test("XML ordered JSON export preserves mixed content and string attributes", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByTestId("dashboard-xml.to.json").click();
  await page
    .getByRole("textbox", { name: "text", exact: true })
    .fill('<p id="001">前<b>中文</b>后</p>');
  await page.getByRole("button", { name: "运行工具" }).click();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载", exact: true }).click();
  const file = await pending;
  expect(file.suggestedFilename()).toBe("xml.to.json.json");
  const data = JSON.parse(await readFile((await file.path())!, "utf8"));
  expect(data[0][":@"]["@_id"]).toBe("001");
  expect(data[0].p).toEqual([
    { "#text": "前" },
    { b: [{ "#text": "中文" }] },
    { "#text": "后" },
  ]);
});
