import { test, expect } from "@playwright/test";
import { homeUrl } from "./config";
import { ElementTest } from "./elementsTest";

test.use({
	ignoreHTTPSErrors: true,
});

test("Guest first view", async ({ page }) => {
	await page.goto(homeUrl);
	await expect(page).toHaveURL(`${homeUrl}/sign-in-view`);
	const header = page.getByRole("heading");
	await expect(header).toHaveText("Sign in to your account");
	await ElementTest.labelTest(page, "Your Username");
	await ElementTest.labelTest(page, "Your Password");
	await ElementTest.buttonTest(page, "Sign in");
});

test("Home page visibility test", async ({ page }) => {
	await page.goto(homeUrl);
	await expect(
		page.getByRole("textbox", { name: "Your Username" }),
	).toBeVisible();
	await expect(
		page.getByRole("textbox", { name: "Your Password" }),
	).toBeVisible();
	await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Sign up", exact: true }),
	).toBeVisible();
	await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Sign Up", exact: true }),
	).toBeVisible();
	await expect(
		page.locator("theme-toggle-component").getByRole("button"),
	).toBeVisible();
});
