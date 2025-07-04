import { test, expect } from "@playwright/test";
import { homeUrl, registeredUsers } from "./config";
import { TestingUtils } from "./TestingUtils";

const randomString = () => Math.random().toString(36).substring(2, 15);

test("open chat and send message", async ({ browser }) => {
	//Two browsers
	const user1Context = await browser.newContext();
	const user2Context = await browser.newContext();

	const user1Page = await user1Context.newPage();
	const user2Page = await user2Context.newPage();

	await TestingUtils.logInStep(user1Page, registeredUsers.user1);
	await TestingUtils.logInStep(user2Page, registeredUsers.user2);

	//open chat and verify buttons
	await user1Page.locator("#min-max-button").click();
	await expect(
		user1Page.getByRole("textbox", { name: "enter your message" }),
	).toBeVisible();
	await expect(user1Page.locator("#send-button")).toBeVisible();
	// await expect(user1Page.locator("#invite-button")).toBeVisible();
	// await expect(user1Page.locator("#block-button")).toBeVisible();

	//send a message to user 2
	const from1To2 =
		"hello " +
		registeredUsers.user2.nickname +
		"! a unique message for you: " +
		randomString();
	await user1Page
		.getByRole("button", { name: registeredUsers.user2.nickname })
		.click();
	await user1Page
		.getByRole("textbox", { name: "enter your message" })
		.click();
	await user1Page
		.getByRole("textbox", { name: "enter your message" })
		.fill(from1To2);
	await user1Page.locator("#send-button").click();
	await expect(
		user1Page.getByRole("textbox", { name: "enter your message" }),
	).toBeVisible();
	await expect(user1Page.getByText(from1To2)).toBeVisible();

	//user 2 can see the message in chat
	await user2Page.locator("#min-max-button").click();
	await user2Page
		.getByRole("button", { name: registeredUsers.user1.nickname })
		.click();
	await expect(user2Page.getByText(from1To2)).toBeVisible();

	//user2 can reply
	const from2To1 =
		"hello " +
		registeredUsers.user1.nickname +
		"! a unique message for you: " +
		randomString();
	await user2Page
		.getByRole("textbox", { name: "enter your message" })
		.fill(from2To1);
	await user2Page
		.getByRole("textbox", { name: "enter your message" })
		.press("Enter");
	await expect(
		user2Page.getByRole("textbox", { name: "enter your message" }),
	).toBeVisible();
	await user1Page.screenshot({  
        path: `ete_tests/screenshots/chatUser1.png`,  
    });  
    await user2Page.screenshot({  
        path: `ete_tests/screenshots/chatUser2.png`,  
    });  
	await expect(user2Page.getByText(from2To1)).toBeVisible();
	await expect(user1Page.getByText(from2To1)).toBeVisible();
});

test("open chat and invite user2", async ({ browser }) => {
	//Two browsers
	const user1Context = await browser.newContext();
	const user2Context = await browser.newContext();

	const user1Page = await user1Context.newPage();
	const user2Page = await user2Context.newPage();

	await TestingUtils.logInStep(user1Page, registeredUsers.user1);
	await TestingUtils.logInStep(user2Page, registeredUsers.user2);

	//open chat and invite user2
	await user1Page.locator("#min-max-button").click();
	await user1Page
		.getByRole("button", { name: registeredUsers.user2.nickname })
		.click();
	await user1Page.locator("#invite-button").click();

	//user2 should accept the invite
	await user2Page.locator("#min-max-button").click();
	await user2Page
		.getByRole("button", { name: registeredUsers.user1.nickname })
		.click();
	await user2Page
		.getByRole("link", { name: "Click to join game", exact: true })
		.click();

	TestingUtils.gameRunningTest(
		user1Page,
		"InviteGame",
		[],
		[
			'"matchStatus":"Game is running"',
			'"roomId"',
			'"knockoutName":"single match"',
		],
		3000,
	);
	await TestingUtils.gameRunningTest(
		user2Page,
		"InviteGame",
		[],
		[
			'"matchStatus":"Game is running"',
			'"roomId"',
			'"knockoutName":"single match"',
		],
		3000,
	);
});

test("open chat and block user2", async ({ browser }) => {
	//Two browsers
	const user1Context = await browser.newContext();
	const user2Context = await browser.newContext();

	const user1Page = await user1Context.newPage();
	const user2Page = await user2Context.newPage();

	await TestingUtils.logInStep(user1Page, registeredUsers.user1);
	await TestingUtils.logInStep(user2Page, registeredUsers.user2);

	//open chat and block user2
	await user1Page.locator("#min-max-button").click();
	await user1Page
		.getByRole("button", { name: registeredUsers.user2.nickname })
		.click();
	await user1Page.locator("#block-button").click();

	//user1 should not see user2's messages
	const from2To1 =
		"hello " +
		registeredUsers.user1.nickname +
		"! a unique message for you: " +
		randomString();
	await user2Page.locator("#min-max-button").click();
	await user2Page
		.getByRole("button", { name: registeredUsers.user1.nickname })
		.click();
	await user2Page
		.getByRole("textbox", { name: "enter your message" })
		.fill(from2To1);
	await user2Page
		.getByRole("textbox", { name: "enter your message" })
		.press("Enter");
	await user2Page.screenshot({
		path: `ete_tests/screenshots/${registeredUsers.user2.nickname}_messaged_${registeredUsers.user1.nickname}.png`,
	});
	await user1Page.screenshot({
		path: `ete_tests/screenshots/${registeredUsers.user1.nickname}_blocked_${registeredUsers.user2.nickname}.png`,
	});
	await expect(user2Page.getByText(from2To1)).toBeVisible();
	await expect(user1Page.getByText(from2To1)).not.toBeVisible();
});
