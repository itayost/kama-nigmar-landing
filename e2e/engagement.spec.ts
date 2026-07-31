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
  options: {
    title: string;
    slug: string;
    tag: string;
    paragraphs: number;
    episodeUrl?: string;
  },
) {
  await page.goto("/admin/articles/new");
  await page.locator('input[name="title"]').fill(options.title);
  await page.locator('input[name="authorName"]').fill("בודק אוטומטי");
  await page.locator('input[name="slug"]').fill(options.slug);
  if (options.episodeUrl) {
    await page.locator('input[name="episodeUrl"]').fill(options.episodeUrl);
  }
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
      await expect(page.getByTestId("player-bar")).toBeVisible();
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
    await expect(anonPage.getByTestId("player-bar")).toHaveCount(0);
    await anon.close();
  });

  test("daily poll and episode callout", async ({ page }) => {
    const ts = Date.now();
    const question = `מי מנצח הערב? ${ts}`;
    const article = {
      title: `כתבה עם פרק ${ts}`,
      slug: `e2e-episode-${ts}`,
      tag: `בדיקה-${ts}`,
      paragraphs: 1,
      episodeUrl: "https://open.spotify.com/episode/4rOoJ6Egrf8K2IrywzwOMk",
    };

    await login(page);

    // Create + activate a poll.
    await page.goto("/admin/polls");
    await page.locator('input[name="question"]').fill(question);
    await page.locator('input[name="option"]').nth(0).fill("מכבי");
    await page.locator('input[name="option"]').nth(1).fill("הפועל");
    await page.getByRole("button", { name: "יצירת סקר" }).click();
    const pollRow = page.getByRole("listitem").filter({ hasText: question });
    await expect(pollRow).toBeVisible();
    await pollRow.getByRole("button", { name: "הפעלה" }).click();
    await expect(pollRow.getByText("פעיל")).toBeVisible();

    await createArticle(page, article);

    // Article shows the episode callout and the poll; voting reveals results.
    await page.goto(`/articles/${article.slug}`);
    await expect(
      page.locator('aside[aria-label="האזינו לפרק על הסיפור הזה"]'),
    ).toBeVisible();
    await expect(page.getByText(question)).toBeVisible();
    await page.getByRole("button", { name: "מכבי", exact: true }).click();
    await expect(page.getByText("הצבעה אחת")).toBeVisible();
    await expect(page.getByText(/%/).first()).toBeVisible();

    // Results persist on reload (localStorage).
    await page.reload();
    await expect(page.getByText("הצבעה אחת")).toBeVisible();

    // Cleanup: poll, article, tag.
    await page.goto("/admin/polls");
    const cleanupRow = page.getByRole("listitem").filter({ hasText: question });
    await cleanupRow.getByRole("button", { name: "מחיקה" }).click();
    await cleanupRow.getByRole("button", { name: "מחיקה" }).last().click();
    await expect(page.getByText(question)).toHaveCount(0);
    await deleteArticle(page, article.title);
    await page.goto("/admin/tags");
    const tagRow = page.getByRole("listitem").filter({ hasText: article.tag });
    await tagRow.getByRole("button", { name: "מחיקה" }).click();
    await tagRow.getByRole("button", { name: "מחיקה" }).last().click();
    await expect(page.getByText(article.tag, { exact: true })).toHaveCount(0);
  });
});
