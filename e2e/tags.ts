import { expect, type Locator, type Page } from "@playwright/test";

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
