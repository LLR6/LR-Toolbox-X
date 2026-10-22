import { test, expect } from "@playwright/test";
test("dashboard opens real tools, saves favorites and keeps content private", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /让一切更高效/ }),
  ).toBeVisible();
  await page.getByTestId("dashboard-csv.to.json").click();
  await page
    .getByRole("textbox", { name: "text", exact: true })
    .fill("name,value\nLR,42");
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("status")).toContainText("42");
  await page.getByRole("button", { name: "Close tool" }).click();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: /全部工具/ })
    .click();
  await page.getByRole("textbox", { name: "搜索工具" }).fill("csv.to.json");
  await page
    .getByRole("button", { name: "Favorite csv.to.json", exact: true })
    .click();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: /我的收藏/ })
    .click();
  await expect(page.getByTestId("action-csv.to.json")).toBeVisible();
  const stored = await page.evaluate(() => localStorage.getItem("lrx.history"));
  expect(stored).not.toContain("name,value");
  expect(Object.keys(JSON.parse(stored!)[0]).sort()).toEqual([
    "elapsedMs",
    "id",
    "status",
    "time",
  ]);
});
test("mobile layout keeps navigation, search and workflow usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /让一切更高效/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page
    .getByRole("textbox", { name: "搜索工具" })
    .fill("network.ipv4.inspect");
  await page.getByTestId("action-network.ipv4.inspect").click();
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("status")).toContainText("192.168.1.0");
  await page.getByRole("button", { name: "Close tool" }).click();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: /工作流/ })
    .click();
  await page.getByRole("button", { name: "运行工作流" }).click();
  await expect(page.getByRole("status")).toContainText("SGVsbG8gTFI=");
});
test("theme and language controls preserve the working dashboard", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByTitle("Switch theme").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByTitle("Switch language").click();
  await expect(
    page.getByRole("heading", { name: "Make every day flow. ✦" }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search tools" })
    .fill("semver.compare");
  await page.getByTestId("action-semver.compare").click();
  await page.getByRole("button", { name: "Run action" }).click();
  await expect(page.getByRole("status")).toContainText("-1");
});
test("home favorites persist and open the matching real tool", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByTestId("dashboard-csv.to.json").hover();
  await page
    .getByRole("button", { name: "Favorite csv.to.json", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Unfavorite csv.to.json", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: /我的收藏/ })
    .click();
  await page.getByTestId("action-csv.to.json").click();
  await expect(page.getByRole("dialog")).toHaveAccessibleName("CSV to JSON");
});
test("keyboard palette ignores collection filters and dialog traps focus", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator(".sidebar .collection-nav")
    .getByRole("button", { name: /JSON 与数据/ })
    .click();
  await page.keyboard.press("Control+k");
  await page
    .getByRole("textbox", { name: "Command search" })
    .fill("hash.sha256");
  await page.getByRole("textbox", { name: "Command search" }).press("Enter");
  await expect(page.getByRole("dialog")).toHaveAccessibleName("SHA-256 digest");
  await expect(
    page.getByRole("textbox", { name: "text", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Close tool" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "填入示例" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("home search Enter opens a matching action without clearing the query", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("textbox", { name: "搜索工具" })
    .fill("encoding.base64url.encode");
  await page.getByRole("textbox", { name: "搜索工具" }).press("Enter");
  await expect(page.getByRole("dialog")).toHaveAccessibleName(
    "Encode Base64URL",
  );
  await page.getByRole("button", { name: "运行工具" }).click();
  await expect(page.getByRole("status")).toHaveText("SGVsbG8_");
});
