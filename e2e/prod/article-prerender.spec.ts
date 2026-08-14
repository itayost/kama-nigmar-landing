import { expect, test, type Page } from "@playwright/test";

// Requires a build pointed at a Neon dev branch (never production) and the admin
// password exported as an E2E env var.
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "";

const MISSING_NUMBER = 999_999;
const NOT_FOUND_COPY = "הכתבה לא נמצאה";
const NOINDEX_META = /<meta name="robots" content="[^"]*noindex/;

async function login(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "כניסה" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

async function publishArticle(
  page: Page,
  title: string,
  paragraph: string,
): Promise<string> {
  await page.getByRole("link", { name: "+ כתבה חדשה" }).click();
  await page.locator('input[name="title"]').fill(title);
  await page.locator('input[name="authorName"]').fill("בודק אוטומטי");
  await page.getByRole("radio", { name: "פורסם" }).check();
  await page.getByRole("button", { name: "+ פסקה" }).click();
  await page.getByPlaceholder("כתבו כאן את הפסקה...").fill(paragraph);
  await page.getByRole("button", { name: "שמירה" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/articles");
  const href = await page
    .getByRole("link")
    .filter({ has: page.getByRole("heading", { name: title, exact: true }) })
    .first()
    .getAttribute("href");
  expect(href).toMatch(/^\/articles\/\d+$/);
  return href!;
}

async function deleteArticle(page: Page, title: string): Promise<void> {
  await page.goto("/admin");
  const row = page.getByRole("listitem").filter({ hasText: title });
  await row.getByRole("button", { name: "מחיקה" }).click();
  await row.getByRole("button", { name: "מחיקה" }).last().click();
  await expect(page.getByText(title)).toHaveCount(0);
}

test.describe("article prerendering", () => {
  test.skip(!ADMIN_PASSWORD, "Set E2E_ADMIN_PASSWORD to run the admin E2E flow");

  // Regression: generateStaticParams only covers articles that existed at build time.
  // Every other param used to share one prerendered entry keyed on /articles/[slug], so
  // whatever the first uncovered request rendered — normally a notFound(), since bots hit
  // nonexistent numbers constantly — was replayed at a 200 for every article published
  // since the last deploy. The same defect could serve one article's HTML on another
  // article's URL. Requesting a missing number first is what arms it; without that step
  // this passes either way. Only reproducible against a build, never against `next dev`.
  test("an article published after the build does not inherit the not-found render", async ({
    page,
    request,
  }) => {
    const title = `בדיקת פרסום אחרי בילד ${Date.now()}`;
    const paragraph = "פסקה לבדיקת בידוד המטמון בין כתובות כתבה.";

    // Arms the bug: this render is what used to get stored and replayed.
    const armed = await request.get(`/articles/${MISSING_NUMBER}`);
    expect(armed.status()).toBe(200);
    expect(await armed.text()).toContain(NOT_FOUND_COPY);

    await login(page);
    const articleUrl = await publishArticle(page, title, paragraph);

    await page.goto(articleUrl);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText(paragraph)).toBeVisible();
    await expect(page.getByText(NOT_FOUND_COPY)).toHaveCount(0);

    // A real article and a missing one must never resolve to the same document.
    const [publishedBody, missingBody] = await Promise.all([
      request.get(articleUrl).then((r) => r.text()),
      request.get(`/articles/${MISSING_NUMBER}`).then((r) => r.text()),
    ]);
    expect(publishedBody).toContain(title);
    expect(publishedBody).not.toBe(missingBody);
    expect(missingBody).toContain(NOT_FOUND_COPY);

    // The head is baked into the same entry as the body, so a shared entry also served a
    // noindex head on every uncovered article. That half is invisible to a reader and is
    // the half that costs search traffic.
    expect(publishedBody).not.toMatch(NOINDEX_META);
    expect(missingBody).toMatch(NOINDEX_META);

    await deleteArticle(page, title);
  });
});
