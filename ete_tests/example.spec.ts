import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
	await page.goto("https://playwright.dev/");

	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/Playwright/);
});

test("get started link", async ({ page }) => {
	await page.goto("https://playwright.dev/");

	// Click the get started link.
	await page.getByRole("link", { name: "Get started" }).click();

	// Expects page to have a heading with the name of Installation.
	await expect(
		page.getByRole("heading", { name: "Installation" }),
	).toBeVisible();
});

// test("first Filip test", async ({ page }) => {
// 	await page.goto("https://10.12.7.1:8080/sign-in-view");
// 	const header= page.getByRole("heading")
// 	await expect(header).toHaveText("Sign in to your account");
// });
