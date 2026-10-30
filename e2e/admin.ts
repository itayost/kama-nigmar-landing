import { expect, type Locator, type Page } from "@playwright/test";

// Shared admin steps. The configs run the server against the local Docker
// database with the local admin login (scripts/local-env.ts) and hand its
// password to the specs; production is never touched.
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "";

export async function login(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "כניסה" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

export async function deleteArticle(page: Page, title: string): Promise<void> {
  await page.goto("/admin");
  const row = page.getByRole("listitem").filter({ hasText: title });
  await row.getByRole("button", { name: "מחיקה" }).click();
  await row.getByRole("button", { name: "מחיקה" }).last().click();
  await expect(page.getByText(title)).toHaveCount(0);
}

// A tag on the /admin/tags board. A chip reads "<name><article count>", so
// match the name's own text exactly.
export function tagChip(page: Page, name: string): Locator {
  return page.getByRole("listitem").getByRole("button").filter({ has: page.getByText(name, { exact: true }) });
}

// Deletes a tag from the board: select it, then confirm in its panel.
export async function deleteTag(page: Page, name: string): Promise<void> {
  await page.goto("/admin/tags");
  await tagChip(page, name).click();
  await page.getByRole("button", { name: "מחיקת התגית" }).click();
  await page.getByRole("button", { name: "מחיקה", exact: true }).click();
  await expect(tagChip(page, name)).toHaveCount(0);
}
