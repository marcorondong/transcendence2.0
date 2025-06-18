import { test, expect } from "@playwright/test";
import { homeUrl, registeredUsers } from "./config";
import { TestingUtils } from "./elementsTest";

test.use({
	ignoreHTTPSErrors: true,
});

test("Login checkpoint", async ({ page }) => {
	await page.goto(homeUrl);
	await page.getByRole("textbox", { name: "Your Username" }).click();
	await page.getByRole("textbox", { name: "Your Username" }).fill("fseles");
	await page.getByRole("textbox", { name: "Your Username" }).press("Tab");
	// await page.getByRole('button', { name: 'Sign in' }).click();
	await page.getByRole("textbox", { name: "Your Password" }).click();
	await page.getByRole("textbox", { name: "Your Password" }).fill("Pong123!");
	await page.getByRole("button", { name: "Sign in" }).click();
});

test("Login and game visibility", async ({ page }) => {
	await TestingUtils.logInStep(page, registeredUsers.user1);
	await expect(page.locator("#pong")).toBeVisible();
	await page.locator("#pong").click();
	await expect(
		page.getByRole("button", { name: "Single Player Mode" }),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Tournament Mode" }),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Tournament Mode" }),
	).toBeVisible();
	await page.getByRole("button", { name: "Single Player Mode" }).click();
	await expect(
		page.getByRole("button", { name: "Play Random Opponent" }),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Play Normal AI" }),
	).toBeVisible();
	await page.getByRole("button", { name: "Play Normal AI" }).click();
	await expect(page.getByText("Knockout Name: single match")).toBeVisible();
	await expect(page.getByText("Match Status: Game is running")).toBeVisible();
});

test("Two users play against each other", async ({ browser }) => {
	//Two browsers
	const user1Context = await browser.newContext();
	const user2Context = await browser.newContext();
});
