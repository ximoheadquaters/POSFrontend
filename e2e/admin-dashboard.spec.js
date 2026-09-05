import { test, expect } from "@playwright/test";

const adminEmail = process.env.XIMO_ADMIN_EMAIL;
const adminPassword = process.env.XIMO_ADMIN_PASSWORD;

test("authenticated admin can render the dashboard", async ({ page }) => {
  test.skip(
    !adminEmail || !adminPassword,
    "Set XIMO_ADMIN_EMAIL and XIMO_ADMIN_PASSWORD to run the authenticated smoke test.",
  );

  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email address" }).fill(adminEmail);
  await page.getByRole("textbox", { name: "Password" }).fill(adminPassword);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/admin(?:\?|$)/, { timeout: 20_000 });
  await expect(
    page.getByRole("heading", { name: "Good morning, admin." }),
  ).toBeVisible();
});