import { expect, test, type Page } from "@playwright/test";
import { deleteArticle, deleteTag, login } from "./admin";

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

async function createArticle(
  page: Page,
  options: {
    title: string;
    tag: string;
    paragraphs: number;
    episodeUrl?: string;
    pollLabel?: string;
  },
): Promise<string> {
  await page.goto("/admin/articles/new");
  await page.locator('input[name="title"]').fill(options.title);
  await page.locator('input[name="authorName"]').fill("בודק אוטומטי");
  if (options.episodeUrl) {
    await page.locator('input[name="episodeUrl"]').fill(options.episodeUrl);
  }
  if (options.pollLabel) {
    await page.locator('select[name="pollId"]').selectOption({ label: options.pollLabel });
  }
  // The picker selects an existing tag on Enter and offers to create a new one,
  // which lands in the inbox; shared tags are what link the test articles.
  const tagsInput = page.getByRole("textbox", { name: "חיפוש תגית" });
  await tagsInput.fill(options.tag);
  const create = page.getByRole("button", { name: "הוספה", exact: true });
  if (await create.isVisible()) await create.click();
  else await tagsInput.press("Enter");
  await expect(page.getByRole("list", { name: "התגיות שנבחרו" })).toContainText(options.tag);
  await page.getByRole("radio", { name: "פורסם" }).check();
  for (let i = 0; i < options.paragraphs; i += 1) {
    await page.getByRole("button", { name: "+ פסקה" }).click();
    await page
      .getByRole("textbox", { name: "טקסט הפסקה" })
      .nth(i)
      .fill(`פסקת בדיקה מספר ${i + 1} עם קצת תוכן כדי שתהיה אמיתית.`);
  }
  await page.getByRole("button", { name: "שמירה" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  return findArticleUrl(page, options.title);
}

test.describe("engagement surfaces", () => {
  test.setTimeout(120_000);

  test("recirculation modules, player bar, and share button", async ({ page }) => {
    const ts = Date.now();
    const tag = `בדיקה-${ts}`;
    const long = { title: `כתבה ארוכה ${ts}`, tag, paragraphs: 4 };
    const shortA = { title: `כתבה קצרה א ${ts}`, tag, paragraphs: 1 };
    const shortB = { title: `כתבה קצרה ב ${ts}`, tag, paragraphs: 1 };

    await login(page);
    const shortAUrl = await createArticle(page, shortA);
    await createArticle(page, shortB);
    const longUrl = await createArticle(page, long);

    // Long article: mid-article module with the two same-tag articles.
    await page.goto(longUrl);
    const midModule = page.locator('aside[aria-label="עוד באותו נושא"]');
    await expect(midModule).toBeVisible();
    await expect(midModule.getByRole("link")).toHaveCount(2);

    // End rows: related row present; no article recommended twice on the page.
    // The mid-article module carries an h2 with the same name, so target the
    // end-of-article section heading by id.
    await expect(page.locator("h2#related-articles-heading")).toBeVisible();
    const recircHrefs = await page
      .locator("aside[aria-label] a[href^='/articles/'], section:has(h2#related-articles-heading) a[href^='/articles/'], section:has(h2#trending-articles-heading) a[href^='/articles/']")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(new Set(recircHrefs).size).toBe(recircHrefs.length);

    // Share button + reading time in the meta row.
    await expect(page.getByRole("button", { name: /שיתוף/ })).toBeVisible();
    await expect(page.getByText(/דק(ת|ות) קריאה/)).toBeVisible();

    // Short article: no mid-article module.
    await page.goto(shortAUrl);
    await expect(page.locator('aside[aria-label="עוד באותו נושא"]')).toHaveCount(0);

    // Player bar on public pages, absent on admin login.
    for (const path of ["/", "/articles", longUrl]) {
      await page.goto(path);
      await expect(page.getByTestId("player-bar")).toBeVisible();
    }

    // Cleanup: articles, then the registry tag.
    await deleteArticle(page, long.title);
    await deleteArticle(page, shortA.title);
    await deleteArticle(page, shortB.title);
    await deleteTag(page, tag);

    // Logged-out login page has no player bar.
    const anon = await page.context().browser()!.newContext();
    const anonPage = await anon.newPage();
    await anonPage.goto("http://localhost:3117/admin/login");
    await expect(anonPage.getByTestId("player-bar")).toHaveCount(0);
    await anon.close();
  });

  test("linked poll mid-article, homepage main poll, and fallback", async ({ page }) => {
    const ts = Date.now();
    const linkedQuestion = `סקר מקושר ${ts}`;
    const mainQuestion = `סקר ראשי ${ts}`;
    const article = {
      title: `כתבה עם סקר ${ts}`,
      tag: `בדיקה-${ts}`,
      paragraphs: 3,
      pollLabel: `${linkedQuestion} ● פעיל`,
    };

    await login(page);

    // Two active polls: one to link, one flagged as main.
    for (const question of [linkedQuestion, mainQuestion]) {
      await page.goto("/admin/polls");
      await page.locator('input[name="question"]').fill(question);
      await page.locator('input[name="option"]').nth(0).fill("כן");
      await page.locator('input[name="option"]').nth(1).fill("לא");
      await page.getByRole("button", { name: "יצירת סקר" }).click();
      const row = page.getByRole("listitem").filter({ hasText: question });
      await row.getByRole("button", { name: "הפעלה" }).click();
      await expect(row.getByText("פעיל")).toBeVisible();
    }
    const mainRow = page.getByRole("listitem").filter({ hasText: mainQuestion });
    await mainRow.getByRole("button", { name: "הצגה בעמוד הבית" }).click();
    await expect(mainRow.getByText("ראשי")).toBeVisible();

    const articleUrl = await createArticle(page, article);

    // Article: the linked poll renders mid-article, and the main poll is absent.
    await page.goto(articleUrl);
    await expect(page.getByText("מה דעתכם?")).toBeVisible();
    await expect(page.getByText(linkedQuestion)).toBeVisible();
    await expect(page.getByText(mainQuestion)).toHaveCount(0);

    // Homepage: the main poll.
    await page.goto("/");
    await expect(page.getByText(mainQuestion)).toBeVisible();

    // Closing the linked poll: the article falls back to the main poll.
    await page.goto("/admin/polls");
    const linkedRow = page.getByRole("listitem").filter({ hasText: linkedQuestion });
    await linkedRow.getByRole("button", { name: "סגירה" }).click();
    await expect(linkedRow.getByText("סגור")).toBeVisible();
    await page.goto(articleUrl);
    await expect(page.getByText(mainQuestion)).toBeVisible();
    await expect(page.getByText(linkedQuestion)).toHaveCount(0);

    // Cleanup: article first (releases the poll link), then polls, then the tag.
    await deleteArticle(page, article.title);
    for (const question of [linkedQuestion, mainQuestion]) {
      await page.goto("/admin/polls");
      const row = page.getByRole("listitem").filter({ hasText: question });
      await row.getByRole("button", { name: "מחיקה" }).click();
      await row.getByRole("button", { name: "מחיקה" }).last().click();
      await expect(page.getByText(question)).toHaveCount(0);
    }
    await deleteTag(page, article.tag);
  });

  test("daily poll and episode callout", async ({ page }) => {
    const ts = Date.now();
    const question = `מי מנצח הערב? ${ts}`;
    const article = {
      title: `כתבה עם פרק ${ts}`,
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

    const articleUrl = await createArticle(page, article);

    // Article shows the episode callout and the poll; voting reveals results.
    await page.goto(articleUrl);
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
    await deleteTag(page, article.tag);
  });
});
