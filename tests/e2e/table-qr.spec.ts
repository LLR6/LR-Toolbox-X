import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("CSV workspace previews bounded rows and exports the entire sorted result", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByTestId("dashboard-csv.sort").click();
  await page
    .getByRole("textbox", { name: "text", exact: true })
    .fill(
      "id,score\n" +
        Array.from({ length: 120 }, (_, j) => `${j + 1},${120 - j}`).join("\n"),
    );
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("row")).toHaveCount(101);
  await expect(page.getByRole("row").nth(1)).toContainText("120");
  const file = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载", exact: true }).click();
  const downloaded = await file;
  expect(downloaded.suggestedFilename()).toBe("csv.sort.csv");
  const content = await readFile((await downloaded.path())!, "utf8");
  expect(content.split("\r\n")).toHaveLength(121);
  expect(content.endsWith("120,1")).toBe(true);
  await page.getByRole("button", { name: "源码", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("120,1");
});
test("mobile QR workspace renders Unicode and exports SVG and PNG", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByTestId("dashboard-qr.generate").click();
  await page
    .getByRole("textbox", { name: "text", exact: true })
    .fill("你好🧪 https://example.com");
  await page.getByRole("combobox", { name: "correction" }).selectOption("H");
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("img", { name: "生成的二维码" })).toBeVisible();
  await expect
    .poll(() =>
      page
        .getByRole("img", { name: "生成的二维码" })
        .evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
    )
    .toBe(true);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  const png = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载 PNG", exact: true }).click();
  const pngFile = await png;
  expect(pngFile.suggestedFilename()).toBe("qr.generate.png");
  const bytes = await readFile((await pngFile.path())!);
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  const svg = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载", exact: true }).click();
  const svgFile = await svg;
  expect(svgFile.suggestedFilename()).toBe("qr.generate.svg");
  expect(await readFile((await svgFile.path())!, "utf8")).toContain(
    'shape-rendering="crispEdges"',
  );
});
