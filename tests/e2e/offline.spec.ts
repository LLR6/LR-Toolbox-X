import { test, expect } from "@playwright/test";
test("online navigation bypasses a stale shell and the full workspace still works offline", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /让一切更高效/ }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await page.evaluate(async () => {
    const key = (await caches.keys()).find((key) => key.startsWith("lrx-"))!;
    const cache = await caches.open(key);
    await cache.put(
      new Request(location.origin + "/"),
      new Response("<h1>Old modal version</h1>", {
        headers: { "Content-Type": "text/html" },
      }),
    );
    localStorage.setItem("lrx.favorites", JSON.stringify(["json.format"]));
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /让一切更高效/ }),
  ).toBeVisible();
  await context.setOffline(true);
  await page.goto("/?offline=check");
  await expect(
    page.getByRole("heading", { name: /让一切更高效/ }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "搜索工具", exact: true })
    .fill("json.format");
  await page.getByTestId("action-json.format").click();
  await expect(
    page.getByRole("region", { name: "Format JSON", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("status")).toContainText('"a": 1');
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("lrx.favorites")!),
    ),
  ).toContain("json.format");
});
