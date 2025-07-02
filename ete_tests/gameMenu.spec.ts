import { test, expect, Browser, Page, BrowserContext } from "@playwright/test";
import { homeUrl, registeredUsers } from "./config";
import { TestingUtils } from "./TestingUtils";
import {scoreBoardConfig} from "../microservices/ssg/pong-api/src/config"

const HUMAN_PLAYERS = 0;
const LONGEST_MATCH_TIME = scoreBoardConfig.match_length + 15
//don't run tests in parallel, for joining games
test.describe.configure({ mode: "serial" });

test.use({
	ignoreHTTPSErrors: true,
});

test("play against bot", async ({ page }) => {
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

test("4 Player Tournament test", async ({ browser }) => {
	test.setTimeout(LONGEST_MATCH_TIME * 2 * 1000);
	const contexts: BrowserContext[] = [];
	const pages: Page[] = [];
	const usersArray = Object.values(registeredUsers);

	for (let i = HUMAN_PLAYERS; i < 4; i++) {
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
	test.setTimeout(LONGEST_MATCH_TIME * 4 * 1000);
	const contexts: BrowserContext[] = [];
	const pages: Page[] = [];
	const usersArray = Object.values(registeredUsers);

	for (let i = HUMAN_PLAYERS; i < 8; i++) {
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

test("16 Player Tournament test", async ({ browser }) => {
	test.setTimeout(LONGEST_MATCH_TIME * 5 * 1000);
	const contexts: BrowserContext[] = [];
	const pages: Page[] = [];
	const usersArray = Object.values(registeredUsers);

	for (let i = HUMAN_PLAYERS; i < 16; i++) {
		const context = await browser.newContext();
		const page = await context.newPage();
		contexts.push(context);
		pages.push(page);
		await TestingUtils.logInStep(page, usersArray[i]);
		await TestingUtils.tournamentStep(page, 16);
	}
	await TestingUtils.takeScreenshotsEvery10Seconds(
		pages,
		"Tournament16",
		30 * 4,
		20,
	);
});

test("2 vs 2 doubles test", async ({ browser }) => {
	test.setTimeout(LONGEST_MATCH_TIME * 2 * 1000);
	const contexts: BrowserContext[] = [];
	const pages: Page[] = [];
	const usersArray = Object.values(registeredUsers);

	for (let i = HUMAN_PLAYERS; i < 4; i++) {
		const context = await browser.newContext();
		const page = await context.newPage();
		contexts.push(context);
		pages.push(page);
		await TestingUtils.logInStep(page, usersArray[i]);
		await TestingUtils.doublesStep(page);
	}
	await TestingUtils.takeScreenshotsEvery10Seconds(
		pages,
		"doubles",
		30 * 3,
		20,
	);
});
