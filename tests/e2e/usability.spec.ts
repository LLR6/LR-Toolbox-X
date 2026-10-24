import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { unzipSync } from "fflate";
test("home search and command palette Enter open the requested file studio", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("textbox", { name: "搜索工具", exact: true })
    .fill("PDF");
  await page
    .getByRole("textbox", { name: "搜索工具", exact: true })
    .press("Enter");
  await expect(page.getByRole("region", { name: "PDF Studio" })).toBeVisible();
  await page.getByRole("button", { name: "Close tool" }).click();
  await page.keyboard.press("Control+k");
  await page.getByRole("textbox", { name: "Command search" }).fill("OCR");
  await page.getByRole("textbox", { name: "Command search" }).press("Enter");
  await expect(
    page.getByRole("region", { name: "Image to Text" }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("file studio history uses readable names and reopens the matching workspace", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem(
      "lrx.history",
      JSON.stringify([
        {
          id: "studio.pdf",
          status: "success",
          elapsedMs: 12,
          time: new Date().toISOString(),
        },
      ]),
    ),
  );
  await page.reload();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "执行历史", exact: true })
    .click();
  await page
    .locator(".history-list")
    .getByRole("button", { name: /PDF 整理台/ })
    .click();
  await expect(page.getByRole("region", { name: "PDF Studio" })).toBeVisible();
});
test("batch compression downloads all actual JPEG outputs in a flat ZIP", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByTestId("studio-compress").click();
  const encoded = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 80;
    c.height = 80;
    const x = c.getContext("2d")!;
    x.fillStyle = "blue";
    x.fillRect(0, 0, 80, 80);
    return c.toDataURL("image/png").split(",")[1];
  });
  await page.locator("input[type=file]").setInputFiles([
    {
      name: "same.png",
      mimeType: "image/png",
      buffer: Buffer.from(encoded, "base64"),
    },
    {
      name: "same.png",
      mimeType: "image/png",
      buffer: Buffer.from(encoded, "base64"),
    },
  ]);
  await page.getByRole("button", { name: "开始处理", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "打包下载全部（2 份）" }),
  ).toBeVisible();
  const waiting = page.waitForEvent("download");
  await page.getByRole("button", { name: "打包下载全部（2 份）" }).click();
  const file = await waiting;
  expect(file.suggestedFilename()).toBe("LR-results.zip");
  const entries = unzipSync(
    new Uint8Array(await readFile((await file.path())!)),
  );
  expect(Object.keys(entries)).toHaveLength(2);
  for (const bytes of Object.values(entries))
    expect([...bytes.subarray(0, 2)]).toEqual([255, 216]);
});
