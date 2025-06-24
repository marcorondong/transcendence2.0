// import { test, expect } from "@playwright/test";
// import { homeUrl, registeredUsers } from "./config";
// import { TestingUtils } from "./TestingUtils";
// import { DebugUtils } from "./debugUtils";

// test.use({
// 	ignoreHTTPSErrors: true,
// 	// Enable all debugging features
// 	actionTimeout: 30000,
// 	navigationTimeout: 30000,
// 	screenshot: "only-on-failure",
// 	video: "retain-on-failure",
// 	trace: "retain-on-failure",
// });

// test.describe.serial("game menu debugging", () => {
// 	test("Login and game against normal bot - DEBUG VERSION", async ({
// 		page,
// 	}) => {
// 		// Set up comprehensive logging
// 		DebugUtils.setupLogging(page);

// 		console.log("🚀 Starting debug test for Play Normal AI button");

// 		// Login step
// 		await TestingUtils.logInStep(page, registeredUsers.user1);
// 		console.log("✅ Login completed");
// 		await DebugUtils.takeScreenshot(page, "after_login");
// 		await DebugUtils.logPageState(page);

// 		// Navigate to pong
// 		await expect(page.locator("#pong")).toBeVisible();
// 		console.log("✅ Pong button is visible");

// 		await page.locator("#pong").click();
// 		console.log("✅ Pong button clicked");
// 		await DebugUtils.takeScreenshot(page, "after_pong_click");

// 		// Wait for navigation
// 		await DebugUtils.waitForNetworkIdle(page);

// 		// Check for game mode buttons
// 		await expect(
// 			page.getByRole("button", { name: "Single Player Mode" }),
// 		).toBeVisible();
// 		console.log("✅ Single Player Mode button is visible");

// 		await expect(
// 			page.getByRole("button", { name: "Tournament Mode" }),
// 		).toBeVisible();
// 		console.log("✅ Tournament Mode button is visible");

// 		// Log all buttons on the page
// 		await DebugUtils.logAllButtons(page);

// 		// Click Single Player Mode
// 		await page.getByRole("button", { name: "Single Player Mode" }).click();
// 		console.log("✅ Single Player Mode button clicked");
// 		await DebugUtils.takeScreenshot(page, "after_single_player_click");

// 		// Wait for navigation and check for opponent selection buttons
// 		await DebugUtils.waitForNetworkIdle(page);

// 		await expect(
// 			page.getByRole("button", { name: "Play Random Opponent" }),
// 		).toBeVisible();
// 		console.log("✅ Play Random Opponent button is visible");

// 		await expect(
// 			page.getByRole("button", { name: "Play Normal AI" }),
// 		).toBeVisible();
// 		console.log("✅ Play Normal AI button is visible");

// 		// Log all buttons again to see what changed
// 		await DebugUtils.logAllButtons(page);

// 		// Debug the Play Normal AI button specifically
// 		await DebugUtils.logElementInfo(
// 			page,
// 			'button:has-text("Play Normal AI")',
// 			"Play Normal AI button details",
// 		);

// 		// Take screenshot before clicking
// 		await DebugUtils.takeScreenshot(page, "before_normal_ai_click");

// 		// Use the debug button click function
// 		await DebugUtils.debugButtonClick(
// 			page,
// 			'button:has-text("Play Normal AI")',
// 			"Play Normal AI",
// 		);

// 		// Wait for expected text to appear
// 		const knockoutFound = await DebugUtils.waitForTextWithTimeout(
// 			page,
// 			"Knockout Name: single match",
// 			10000,
// 		);
// 		if (knockoutFound) {
// 			console.log("✅ Knockout Name text appeared as expected");
// 		} else {
// 			console.log("❌ Knockout Name text did not appear");
// 			// Log current page content for debugging
// 			await DebugUtils.logPageState(page);
// 		}

// 		const matchStatusFound = await DebugUtils.waitForTextWithTimeout(
// 			page,
// 			"Match Status: Game is running",
// 			10000,
// 		);
// 		if (matchStatusFound) {
// 			console.log("✅ Match Status text appeared as expected");
// 		} else {
// 			console.log("❌ Match Status text did not appear");
// 		}

// 		// Final screenshot
// 		await DebugUtils.takeScreenshot(page, "final_state");

// 		console.log("🏁 Debug test completed");
// 		await page.close();
// 	});
// });
