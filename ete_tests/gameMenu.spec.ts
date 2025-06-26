import { test, expect, Browser, Page, BrowserContext } from "@playwright/test";
import { homeUrl, registeredUsers } from "./config";
import { TestingUtils } from "./TestingUtils";

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

test.describe.serial("Game flow", () => {
	test("Login and game against normal bot", async ({ page }) => {
		await TestingUtils.logInStep(page, registeredUsers.user1);
		await expect(page.locator("#pong")).toBeVisible();
		await page.locator("#pong").click();
		await expect(
			page.getByRole("button", { name: "Single Player Mode" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Tournament Mode" }),
		).toBeVisible();
		// Removed redundant check for "Tournament Mode".
		await page.getByRole("button", { name: "Single Player Mode" }).click();
		await expect(
			page.getByRole("button", { name: "Play Random Opponent" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Play Normal AI" }),
		).toBeVisible();
		await page.getByRole("button", { name: "Play Normal AI" }).click();
		await expect(
			page.getByText("Knockout Name: single match"),
		).toBeVisible();
		await expect(
			page.getByText("Match Status: Game is running"),
		).toBeVisible();

		await page.close();
	});

	test("Two users play against each other", async ({ browser }) => {
		//Two browsers
		const user1Context = await browser.newContext();
		const user2Context = await browser.newContext();

		const user1Page = await user1Context.newPage();
		const user2Page = await user2Context.newPage();

		await TestingUtils.logInStep(user1Page, registeredUsers.user1);
		await TestingUtils.logInStep(user2Page, registeredUsers.user2);

		await TestingUtils.randomGameStep(user1Page);
		await TestingUtils.randomGameStep(user2Page);

		await TestingUtils.gameRunningTest(user1Page, "User1RandomGame");
		await TestingUtils.gameRunningTest(user2Page, "User2RandomGame");

		// await expect(page.locator("canvas")).toBeVisible();
		// await expect(page.getByText("Match Status: Game is running")).toBeVisible();
	});
});

test("4 Player Tournament test", async ({ browser }) => {
	const contexts: BrowserContext[] = [];
	const pages: Page[] = [];
	const usersArray = Object.values(registeredUsers);

	for (let i = 0; i < 4; i++) {
		const context = await browser.newContext();
		const page = await context.newPage();
		contexts.push(context);
		pages.push(page);
		await TestingUtils.logInStep(page, usersArray[i]);
		await TestingUtils.tournamentStep(page);
	}
	await TestingUtils.takeScreenshotsEvery10Seconds(
		pages,
		"Tournament4",
		30 * 3,
		20,
	);
});

test("8 Player Tournament test", async ({ browser }) => {
	test.setTimeout(30 * 4 * 1000);
	const contexts: BrowserContext[] = [];
	const pages: Page[] = [];
	const usersArray = Object.values(registeredUsers);

	for (let i = 0; i < 8; i++) {
		const context = await browser.newContext();
		const page = await context.newPage();
		contexts.push(context);
		pages.push(page);
		await TestingUtils.logInStep(page, usersArray[i]);
		await TestingUtils.tournamentStep(page, 8);
	}
	await TestingUtils.takeScreenshotsEvery10Seconds(
		pages,
		"Tournament8",
		30 * 4,
		20,
	);
});
