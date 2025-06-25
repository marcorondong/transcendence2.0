import { test, expect } from "@playwright/test";
import { homeUrl, registeredUsers } from "./config";
import { TestingUtils } from "./TestingUtils";

test.use({
	ignoreHTTPSErrors: true,
});

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
		3000,
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
	TestingUtils.gameRunningTest(
		user1Page,
		"User1RandomGame",
		["Single Player Mode", "Play Random Opponent"],
		[
			'"matchStatus":"Game is running"',
			'"roomId"',
			'"knockoutName":"single match"',
		],
		3000,
	);
	await TestingUtils.gameRunningTest(
		user2Page,
		"User2RandomGame",
		["Single Player Mode", "Play Random Opponent"],
		[
			'"matchStatus":"Game is running"',
			'"roomId"',
			'"knockoutName":"single match"',
		],
		3000,
	);
});
