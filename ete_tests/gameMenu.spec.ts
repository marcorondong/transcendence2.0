import { test, expect } from "@playwright/test";
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

	test("play against bot", async ({page}) => {
		await TestingUtils.logInStep(page, registeredUsers.user1);

		//bot game
		await TestingUtils.gameRunningTest(
			page,
			"BotGame",
			["Single Player Mode", "Play Normal AI"],
			[
				'"matchStatus":"Game is running"',
				'"roomId"',
				'"knockoutName":"single match"',
			],
		);

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

		//1v1 game
		await TestingUtils.gameRunningTest(
			user1Page,
			"User1RandomGame",
			["Single Player Mode", "Play Random Opponent"],
			[
				"Match Status: Game is running",
				"Room Id:",
				"Knockout Name: single match",
			],
		);
		await TestingUtils.gameRunningTest(
			user2Page,
			"User2RandomGame",
			["Single Player Mode", "Play Random Opponent"],
			[
				"Match Status: Game is running",
				"Room Id:",
				"Knockout Name: single match",
			],
		);
	});
});
