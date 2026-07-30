import { expect, test } from "@playwright/test";

// Requires a dev server pointed at a Neon dev branch (never production)
// and the admin credentials exported as E2E env vars.
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "";

test.describe("admin flow", () => {
  test.skip(
    !ADMIN_EMAIL || !ADMIN_PASSWORD,
    "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run the admin E2E flow",
  );

  test("rejects a wrong password with a Hebrew error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[name="password"]').fill("definitely-wrong");
    await page.getByRole("button", { name: "כניסה" }).click();
    await expect(page.getByText("אימייל או סיסמה שגויים")).toBeVisible();
  });

  test("logs in, creates, publishes, views and deletes an article", async ({
    page,
  }) => {
    const slug = `e2e-test-${Date.now()}`;
    const title = `בדיקת מערכת ${Date.now()}`;
    const paragraph = "פסקת בדיקה שנוצרה אוטומטית על ידי הבדיקה.";

    await page.goto("/admin/login");
    await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "כניסה" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.getByRole("link", { name: "+ כתבה חדשה" }).click();
    await page.locator('input[name="title"]').fill(title);
    await page.locator('input[name="authorName"]').fill("בודק אוטומטי");
    await page.locator('input[name="slug"]').fill(slug);
    await page.getByRole("radio", { name: "פורסם" }).check();
    await page.getByRole("button", { name: "+ פסקה" }).click();
    await page.getByPlaceholder("כתבו כאן את הפסקה...").fill(paragraph);
    await page.getByRole("button", { name: "שמירה" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText(title)).toBeVisible();

    await page.goto(`/articles/${slug}`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText(paragraph)).toBeVisible();

    await page.goto("/admin");
    const row = page.getByRole("listitem").filter({ hasText: title });
    await row.getByRole("button", { name: "מחיקה" }).click();
    await expect(row.getByText("למחוק? אי אפשר לבטל")).toBeVisible();
    await row.getByRole("button", { name: "מחיקה" }).last().click();
    await expect(page.getByText(title)).toHaveCount(0);

    await page.goto(`/articles/${slug}`);
    await expect(page.getByText("הכתבה לא נמצאה")).toBeVisible();
  });
});
