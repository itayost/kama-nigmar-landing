import { expect, test, type Page } from "@playwright/test";

// Requires a dev server pointed at a Neon dev branch (never production)
// and the admin password exported as an E2E env var.
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "";

async function findArticleUrl(page: Page, title: string): Promise<string> {
  await page.goto("/articles");
  const href = await page
    .getByRole("link")
    .filter({ has: page.getByRole("heading", { name: title, exact: true }) })
    .first()
    .getAttribute("href");
  expect(href).toMatch(/^\/articles\/\d+$/);
  return href!;
}

test.describe("admin flow", () => {
  test.skip(!ADMIN_PASSWORD, "Set E2E_ADMIN_PASSWORD to run the admin E2E flow");

  test("rejects a wrong password with a Hebrew error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator('input[name="password"]').fill("definitely-wrong");
    await page.getByRole("button", { name: "כניסה" }).click();
    await expect(page.getByText("סיסמה שגויה")).toBeVisible();
  });

  test("logs in, creates, publishes, views and deletes an article", async ({
    page,
  }) => {
    const title = `בדיקת מערכת ${Date.now()}`;
    const paragraph = "פסקת בדיקה שנוצרה אוטומטית על ידי הבדיקה.";

    await page.goto("/admin/login");
    await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "כניסה" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.getByRole("link", { name: "+ כתבה חדשה" }).click();
    await page.locator('input[name="title"]').fill(title);
    await page.locator('input[name="authorName"]').fill("בודק אוטומטי");
    await page.getByRole("radio", { name: "פורסם" }).check();
    await page.getByRole("button", { name: "+ פסקה" }).click();
    await page.getByPlaceholder("כתבו כאן את הפסקה...").fill(paragraph);
    await page.getByRole("button", { name: "שמירה" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText(title)).toBeVisible();

    const articleUrl = await findArticleUrl(page, title);
    await page.goto(articleUrl);
    await expect(page).toHaveURL(/\/articles\/\d+$/);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText(paragraph)).toBeVisible();

    await page.goto("/admin");
    const row = page.getByRole("listitem").filter({ hasText: title });
    await row.getByRole("button", { name: "מחיקה" }).click();
    await expect(row.getByText("למחוק? אי אפשר לבטל")).toBeVisible();
    await row.getByRole("button", { name: "מחיקה" }).last().click();
    await expect(page.getByText(title)).toHaveCount(0);

    await page.goto(articleUrl);
    await expect(page.getByText("הכתבה לא נמצאה")).toBeVisible();
  });

  // Regression: a page rendered for a param that generateStaticParams did not cover is
  // saved to disk, so viewing an article while it is a draft persists the notFound()
  // render. updateTag() alone never clears that artifact and the article stayed at
  // "הכתבה לא נמצאה" after publishing, until the next deploy. Visiting the URL while
  // unpublished is what arms the bug - without that step this passes either way.
  test("republishing clears a not-found page cached while the article was a draft", async ({
    page,
  }) => {
    const title = `בדיקת פרסום מחדש ${Date.now()}`;
    const paragraph = "פסקה לבדיקת ניקוי המטמון לאחר פרסום מחדש.";

    await page.goto("/admin/login");
    await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "כניסה" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.getByRole("link", { name: "+ כתבה חדשה" }).click();
    await page.locator('input[name="title"]').fill(title);
    await page.locator('input[name="authorName"]').fill("בודק אוטומטי");
    await page.getByRole("radio", { name: "פורסם" }).check();
    await page.getByRole("button", { name: "+ פסקה" }).click();
    await page.getByPlaceholder("כתבו כאן את הפסקה...").fill(paragraph);
    await page.getByRole("button", { name: "שמירה" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    // Published first because a draft has no public URL to discover.
    const articleUrl = await findArticleUrl(page, title);

    await page.goto("/admin");
    const row = page.getByRole("listitem").filter({ hasText: title });
    await row.getByRole("button", { name: "הסרת פרסום" }).click();
    await expect(row.getByRole("button", { name: "פרסום" })).toBeVisible();

    // Arms the bug: this render is what gets persisted.
    await page.goto(articleUrl);
    await expect(page.getByText("הכתבה לא נמצאה")).toBeVisible();

    await page.goto("/admin");
    await row.getByRole("button", { name: "פרסום" }).click();
    await expect(row.getByRole("button", { name: "הסרת פרסום" })).toBeVisible();

    await page.goto(articleUrl);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText(paragraph)).toBeVisible();

    await page.goto("/admin");
    await row.getByRole("button", { name: "מחיקה" }).click();
    await row.getByRole("button", { name: "מחיקה" }).last().click();
    await expect(page.getByText(title)).toHaveCount(0);
  });

  test("manages tags centrally and offers them in the article form", async ({
    page,
  }) => {
    const tagName = `תגית-בדיקה-${Date.now()}`;
    const renamed = `${tagName}-חדש`;

    await page.goto("/admin/login");
    await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "כניסה" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.goto("/admin/tags");
    await page.locator('input[name="name"]').fill(tagName);
    await page.getByRole("button", { name: "+ הוספה" }).click();
    await expect(page.getByText(tagName, { exact: true })).toBeVisible();

    await page.goto("/admin/articles/new");
    await expect(page.getByRole("button", { name: `+ ${tagName}` })).toBeVisible();

    await page.goto("/admin/tags");
    const row = page.getByRole("listitem").filter({ hasText: tagName });
    await row.getByRole("button", { name: "שינוי שם" }).click();
    // In rename mode the tag name lives in the input value, which hasText
    // does not match - target the row-scoped rename input directly.
    const renameInput = page.getByRole("listitem").locator('input[name="name"]');
    await renameInput.fill(renamed);
    await page.getByRole("listitem").getByRole("button", { name: "שמירה" }).click();
    await expect(page.getByText(renamed, { exact: true })).toBeVisible();

    const renamedRow = page.getByRole("listitem").filter({ hasText: renamed });
    await renamedRow.getByRole("button", { name: "מחיקה" }).click();
    await renamedRow.getByRole("button", { name: "מחיקה" }).last().click();
    await expect(page.getByText(renamed, { exact: true })).toHaveCount(0);
  });
});
