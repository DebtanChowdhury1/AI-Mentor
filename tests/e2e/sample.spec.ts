import { test, expect } from "@playwright/test";

test("homepage has hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Learn Smarter with AI Mentor")).toBeVisible();
});
