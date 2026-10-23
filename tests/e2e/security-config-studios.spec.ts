import { test, expect, type Page } from "@playwright/test";

async function open(page: Page, id: string) {
  await page.goto("/");
  await page.getByTestId(`studio-${id}`).click();
}

test("JOSE studio signs and verifies a JWT and round-trips JWE locally", async ({ page }) => {
  await open(page, "jose");
  await page.getByLabel("JWT payload").fill('{"sub":"LR","scope":"toolbox","level":11}');
  await page.getByRole("button", { name: "签名 JWT", exact: true }).click();
  const token = page.getByLabel("Compact JWT");
  await expect(token).toHaveValue(/^[^.]+\.[^.]+\.[^.]+$/, { timeout: 20000 });
  await page.getByRole("button", { name: "验证签名", exact: true }).click();
  await expect(page.getByTestId("jwt-verified")).toContainText('"sub": "LR"');
  await expect(page.getByTestId("jwt-verified")).toContainText('"alg": "HS256"');

  await page.getByLabel("JWE plaintext").fill("LR private local message");
  await page.getByRole("button", { name: "加密 JWE", exact: true }).click();
  await expect(page.getByLabel("Compact JWE")).toHaveValue(/^[^.]+\.[^.]*\.[^.]+\.[^.]+\.[^.]+$/);
  await page.getByRole("button", { name: "解密验证", exact: true }).click();
  await expect(page.getByTestId("jwe-decrypted")).toHaveText("LR private local message");
  await expect(page.getByRole("status")).toContainText("处理完成");
});

test("JOSE verification rejects a token after changing the local secret", async ({ page }) => {
  await open(page, "jose");
  await page.getByRole("button", { name: "签名 JWT", exact: true }).click();
  await page.getByLabel("JOSE local secret").fill("a-different-local-secret-2026");
  await page.getByRole("button", { name: "验证签名", exact: true }).click();
  await expect(page.getByRole("status")).not.toContainText("处理完成");
  await expect(page.locator(".security-config-status.error")).toBeVisible();
});

test("TOML studio parses, validates and round-trips TOML and JSON", async ({ page }) => {
  await open(page, "toml");
  await page.getByLabel("TOML source").fill('title = "LR"\ncount = 31\n[flags]\nlocal = true\n');
  await page.getByRole("button", { name: "解析并校验", exact: true }).click();
  await expect(page.getByLabel("TOML JSON")).toHaveValue(/"count": 31/);
  await expect(page.getByLabel("TOML JSON")).toHaveValue(/"local": true/);
  await page.getByLabel("TOML JSON").fill('{"title":"LR Toolbox X","count":33,"flags":{"local":true,"safe":true}}');
  await page.getByRole("button", { name: "JSON → TOML", exact: true }).click();
  await expect(page.getByLabel("TOML source")).toHaveValue(/count = 33/);
  await expect(page.locator(".roundtrip-pane")).toContainText("safe = true");
});
