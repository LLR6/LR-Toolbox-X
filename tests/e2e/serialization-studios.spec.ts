import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function open(page: Page, id: string) {
  await page.goto("/");
  await page.getByTestId(`studio-${id}`).click();
}

test("JSONata studio runs a real local query and exports the result", async ({ page }) => {
  await open(page, "jsonata");
  await page.getByLabel("JSONata input").fill('{"items":[{"price":3},{"price":7},{"price":11}]}');
  await page.getByLabel("JSONata expression").fill("$sum(items.price)");
  await page.getByRole("button", { name: "执行查询", exact: true }).click();
  await expect(page.locator(".result-card pre")).toContainText("21", { timeout: 20000 });
  const pending = page.waitForEvent("download");
  await page.locator(".result-card").getByRole("button", { name: "JSON", exact: true }).click();
  const file = await pending;
  expect(await readFile((await file.path())!, "utf8")).toContain("21");
});

test("Protobuf studio compiles schema, encodes wire bytes and decodes them back", async ({ page }) => {
  await open(page, "protobuf");
  await page.getByLabel("Proto schema").fill('syntax = "proto3"; package lr; message Demo { string title = 1; uint32 count = 2; repeated string tags = 3; }');
  await page.getByLabel("Proto message type").fill("lr.Demo");
  await page.getByLabel("Proto JSON").fill('{"title":"Toolbox","count":27,"tags":["local","wasm"]}');
  await page.getByRole("button", { name: "编码", exact: true }).click();
  await expect(page.getByLabel("Proto wire bytes")).not.toHaveValue("");
  await page.getByRole("button", { name: "解码", exact: true }).click();
  await expect(page.locator(".wire-step pre")).toContainText('"title": "Toolbox"');
  await expect(page.locator(".wire-step pre")).toContainText('"count": 27');
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载二进制", exact: true }).click();
  const file = await pending;
  expect((await readFile((await file.path())!)).length).toBeGreaterThan(5);
});

test("MessagePack studio round-trips JSON through real binary bytes", async ({ page }) => {
  await open(page, "msgpack");
  await page.getByLabel("MessagePack JSON").fill('{"project":"LR","values":[1,2,3],"ok":true}');
  await page.getByRole("button", { name: "编码为二进制", exact: true }).click();
  await expect(page.getByLabel("MessagePack wire bytes")).not.toHaveValue("");
  await expect(page.locator(".byte-strip span")).not.toHaveCount(0);
  await page.getByRole("button", { name: "回读解码", exact: true }).click();
  await expect(page.locator(".wire-card pre")).toContainText('"project": "LR"');
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载", exact: true }).click();
  const file = await pending;
  expect((await readFile((await file.path())!)).length).toBeGreaterThan(4);
});

test("CBOR studio round-trips JSON through real binary bytes", async ({ page }) => {
  await open(page, "cbor");
  await page.getByLabel("CBOR JSON").fill('{"name":"LR Toolbox X","version":11,"nested":{"ready":true}}');
  await page.getByRole("button", { name: "编码为二进制", exact: true }).click();
  await expect(page.getByLabel("CBOR wire bytes")).not.toHaveValue("");
  await page.getByRole("button", { name: "回读解码", exact: true }).click();
  await expect(page.locator(".wire-card pre")).toContainText('"version": 11');
  await expect(page.getByRole("status")).toContainText("处理完成");
});
