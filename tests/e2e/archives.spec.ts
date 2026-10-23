import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
test("ZIP workflow downloads a real archive, imports its directory and extracts a selected file", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByTestId("dashboard-archive.zip.create").click();
  await page
    .getByRole("textbox", { name: "text", exact: true })
    .fill(
      JSON.stringify({
        "说明.txt": "中文🧪",
        "notes/readme.md": "# Offline archive",
      }),
    );
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("status")).toContainText("archive.zip");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载", exact: true }).click();
  const archive = await pending;
  expect(archive.suggestedFilename()).toBe("archive.zip");
  const bytes = await readFile((await archive.path())!);
  expect([...bytes.subarray(0, 4)]).toEqual([80, 75, 3, 4]);
  await page.getByRole("button", { name: "Close tool" }).click();
  await page.getByTestId("dashboard-archive.zip.list").click();
  await page
    .locator('input[type="file"]')
    .setInputFiles({
      name: "archive.zip",
      mimeType: "application/zip",
      buffer: bytes,
    });
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("table")).toContainText("notes/readme.md");
  await page
    .getByRole("row")
    .filter({ hasText: "notes/readme.md" })
    .getByRole("button", { name: "提取", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "path", exact: true }),
  ).toHaveValue("notes/readme.md");
  await page.getByRole("button", { name: "运行工具" }).click();
  const extracted = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载", exact: true }).click();
  const file = await extracted;
  expect(file.suggestedFilename()).toBe("readme.md");
  expect(await readFile((await file.path())!, "utf8")).toBe(
    "# Offline archive",
  );
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("mobile GZIP import decodes real bytes, bounds file size and recovers with an example", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByTestId("dashboard-archive.gzip.compress").click();
  await page
    .getByRole("textbox", { name: "text", exact: true })
    .fill("你好🧪\nGZIP round trip");
  await page.getByRole("button", { name: "运行工具" }).click();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载", exact: true }).click();
  const file = await pending;
  const bytes = await readFile((await file.path())!);
  expect(gunzipSync(bytes).toString()).toBe("你好🧪\nGZIP round trip");
  await page.getByRole("button", { name: "Close tool" }).click();
  await page
    .getByRole("textbox", { name: "搜索工具" })
    .fill("archive.gzip.decompress");
  await page.getByTestId("action-archive.gzip.decompress").click();
  await page
    .locator('input[type="file"]')
    .setInputFiles({
      name: "sample.gz",
      mimeType: "application/gzip",
      buffer: bytes,
    });
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("status")).toHaveText("你好🧪\nGZIP round trip");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page
    .locator('input[type="file"]')
    .setInputFiles({
      name: "large.gz",
      mimeType: "application/gzip",
      buffer: Buffer.alloc(512001),
    });
  await expect(page.getByRole("alert")).toContainText("512 KB");
  await expect(page.getByRole("button", { name: "运行工具" })).toBeDisabled();
  await page.getByRole("button", { name: "填入示例", exact: true }).click();
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("status")).toHaveText("你好 LR");
});
