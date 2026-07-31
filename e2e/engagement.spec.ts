import { expect, test, type Page } from "@playwright/test";

const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "";

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "כניסה" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

async function createArticle(
  page: Page,
  options: { title: string; slug: string; tag: string; paragraphs: number },
) {
  await page.goto("/admin/articles/new");
  await page.locator('input[name="title"]').fill(options.title);
  await page.locator('input[name="authorName"]').fill("בודק אוטומטי");
  await page.locator('input[name="slug"]').fill(options.slug);
  const tagsInput = page.getByPlaceholder(/הקלידו תגית/);
  await tagsInput.fill(options.tag);
  await tagsInput.press("Enter");
  await page.getByRole("radio", { name: "פורסם" }).check();
  for (let i = 0; i < options.paragraphs; i += 1) {
    await page.getByRole("button", { name: "+ פסקה" }).click();
    await page
      .getByPlaceholder("כתבו כאן את הפסקה...")
      .nth(i)
      .fill(`פסקת בדיקה מספר ${i + 1} עם קצת תוכן כדי שתהיה אמיתית.`);
  }
  await page.getByRole("button", { name: "שמירה" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

async function deleteArticle(page: Page, title: string) {
  await page.goto("/admin");
  const row = page.getByRole("listitem").filter({ hasText: title });
  await row.getByRole("button", { name: "מחיקה" }).click();
  await row.getByRole("button", { name: "מחיקה" }).last().click();
  await expect(page.getByText(title)).toHaveCount(0);
}

test.describe("engagement surfaces", () => {
  test.skip(!ADMIN_PASSWORD, "Set E2E_ADMIN_PASSWORD to run the engagement E2E flow");
  test.setTimeout(120_000);

  test("recirculation modules, player bar, and share button", async ({ page }) => {
    const ts = Date.now();
    const tag = `בדיקה-${ts}`;
    const long = { title: `כתבה ארוכה ${ts}`, slug: `e2e-long-${ts}`, tag, paragraphs: 4 };
    const shortA = { title: `כתבה קצרה א ${ts}`, slug: `e2e-short-a-${ts}`, tag, paragraphs: 1 };
    const shortB = { title: `כתבה קצרה ב ${ts}`, slug: `e2e-short-b-${ts}`, tag, paragraphs: 1 };

    await login(page);
    await createArticle(page, shortA);
    await createArticle(page, shortB);
    await createArticle(page, long);

    // Long article: mid-article module with the two same-tag articles.
    await page.goto(`/articles/${long.slug}`);
    const midModule = page.locator('aside[aria-label="עוד באותו נושא"]');
    await expect(midModule).toBeVisible();
    await expect(midModule.getByRole("link")).toHaveCount(2);

    // End rows: related row present; no article recommended twice on the page.
    await expect(
      page.getByRole("heading", { name: "עוד באותו נושא" }),
    ).toBeVisible();
    const recircHrefs = await page
      .locator("aside[aria-label] a[href^='/articles/'], section:has(h2#related-articles-heading) a[href^='/articles/'], section:has(h2#trending-articles-heading) a[href^='/articles/']")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(new Set(recircHrefs).size).toBe(recircHrefs.length);

    // Share button + reading time in the meta row.
    await expect(page.getByRole("button", { name: /שיתוף/ })).toBeVisible();
    await expect(page.getByText(/דק(ת|ות) קריאה/)).toBeVisible();

    // Short article: no mid-article module.
    await page.goto(`/articles/${shortA.slug}`);
    await expect(page.locator('aside[aria-label="עוד באותו נושא"]')).toHaveCount(0);

    // Player bar on public pages, absent on admin login.
    for (const path of ["/", "/articles", `/articles/${long.slug}`]) {
      await page.goto(path);
      await expect(page.locator('iframe[title="נגן הפרק האחרון"]')).toBeVisible();
    }

    // Cleanup: articles, then the registry tag.
    await deleteArticle(page, long.title);
    await deleteArticle(page, shortA.title);
    await deleteArticle(page, shortB.title);
    await page.goto("/admin/tags");
    const tagRow = page.getByRole("listitem").filter({ hasText: tag });
    await tagRow.getByRole("button", { name: "מחיקה" }).click();
    await tagRow.getByRole("button", { name: "מחיקה" }).last().click();
    await expect(page.getByText(tag, { exact: true })).toHaveCount(0);

    // Logged-out login page has no player bar.
    const anon = await page.context().browser()!.newContext();
    const anonPage = await anon.newPage();
    await anonPage.goto("http://localhost:3117/admin/login");
    await expect(anonPage.locator('iframe[title="נגן הפרק האחרון"]')).toHaveCount(0);
    await anon.close();
  });
});
