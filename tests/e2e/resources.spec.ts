import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("resource lab exposes four honest pack entries, filters CVEs, exports metadata and opens a real integration", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("textbox", { name: "搜索工具", exact: true })
    .fill("sqlmap");
  await page
    .getByRole("textbox", { name: "搜索工具", exact: true })
    .press("Enter");
  await expect(
    page.getByRole("region", { name: "Open Source Resource Lab" }),
  ).toBeVisible();
  for (const id of ["poc", "sqlmap", "firmware", "cpe"])
    await expect(page.getByTestId(`pack-${id}`)).toBeVisible();
  await page.getByLabel("查找资源", { exact: true }).fill("CVE-2024-39911");
  await expect(page.locator(".research-file-list")).toContainText(
    "CVE-2024-39911",
  );
  await page.getByTestId("pack-cpe").click();
  await expect(page.locator(".research-file-list")).toContainText(".apk");
  await expect(page.locator(".research-panel").first()).toContainText(
    "未发现网页源码",
  );
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载资源清单 JSON ↓" }).click();
  const file = await pending;
  const json = JSON.parse(await readFile((await file.path())!, "utf8"));
  expect(json.files).toHaveLength(2);
  expect(json.sha256).toMatch(/^[0-9a-f]{64}$/);
  await page
    .getByLabel("本机资源包")
    .setInputFiles({
      name: "wrong.rar",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("not the original"),
    });
  await expect(page.getByRole("alert")).toContainText("大小");
  await page.getByRole("button", { name: "已接入", exact: true }).click();
  await page
    .getByRole("article")
    .filter({ hasText: "jsQR" })
    .getByRole("button")
    .click();
  await expect(
    page.getByRole("region", { name: "QR Image Reader" }),
  ).toBeVisible();
});
test("ICS studio parses a real calendar and downloads its actual events", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByTestId("studio-calendar").click();
  await page.getByRole("button", { name: "解析日历 →" }).click();
  await expect(page.getByRole("status")).toContainText("1 个事件");
  await expect(page.locator("table")).toContainText("专注学习");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载事件 JSON ↓" }).click();
  const file = await pending;
  expect(
    JSON.parse(await readFile((await file.path())!, "utf8"))[0].start,
  ).toContain("2026-10-24");
  await page.getByLabel("ICS 内容", { exact: true }).fill("bad calendar");
  await page.getByRole("button", { name: "解析日历 →" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(0);
});
test("QR reader decodes an actual generated PNG and keeps its URL as text", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByTestId("action-qr.generate").first().click();
  await page
    .getByRole("textbox", { name: "text", exact: true })
    .fill("https://example.test/LR");
  await page.getByRole("button", { name: "运行工具" }).click();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: /PNG/ }).click();
  const file = await pending;
  const png = await readFile((await file.path())!);
  await page.getByRole("button", { name: "Close tool" }).click();
  await page.getByTestId("studio-qrread").click();
  await page
    .getByLabel("二维码图片")
    .setInputFiles({ name: "qr.png", mimeType: "image/png", buffer: png });
  await expect(page.getByLabel("二维码结果")).toHaveValue(
    "https://example.test/LR",
  );
  await expect(page.getByRole("status")).toContainText("本机识别");
  await page
    .getByLabel("二维码图片")
    .setInputFiles({
      name: "bad.png",
      mimeType: "image/png",
      buffer: Buffer.from("invalid"),
    });
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByLabel("二维码结果")).toHaveValue("");
});
