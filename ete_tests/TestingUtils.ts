import { Page, expect } from "@playwright/test";
import { homeUrl, ILogIn } from "./config";

export class TestingUtils {
	static async labelTest(page: Page, labelName: string): Promise<void> {
		const userInput = page.getByLabel(labelName);
		await expect(userInput).toBeVisible();
	}

	static async buttonTest(page: Page, buttonName: string): Promise<void> {
		const button = page.getByRole("button", { name: buttonName });
		await expect(button).toBeVisible();
		await button.click();
	}

	static async logInStep(page: Page, user: ILogIn) {
		await page.goto(homeUrl);
		await page.getByRole("textbox", { name: "Your Username" }).click();
		await page
			.getByRole("textbox", { name: "Your Username" })
			.fill(user.username);
		await page.getByRole("textbox", { name: "Your Username" }).press("Tab");
		// await page.getByRole('button', { name: 'Sign in' }).click();
		await page.getByRole("textbox", { name: "Your Password" }).click();
		await page
			.getByRole("textbox", { name: "Your Password" })
			.fill(user.password);
		await page.getByRole("button", { name: "Sign in" }).click();
	}

	static async randomGameStep(homePage: Page) {
		await homePage.locator("#pong").click();
		await homePage
			.getByRole("button", { name: "Single Player Mode" })
			.click();
		await homePage
			.getByRole("button", { name: "Play Random Opponent" })
			.click();
		await expect(homePage.locator("canvas")).toBeVisible();
	}

	static async clickMenuButtons(page: Page, buttonNames: string[]) {
		for (const buttonName of buttonNames) {
			await page.getByRole("button", { name: buttonName }).click();
		}
	}

	/**
	 * @param page - The page object
	 * @param screenshotName - The name of the screenshot to save
	 * @param gameSelection - PLaywright will click these buttons in the game menu
	 * @param expectedWebsocketMessages - The expected websocket messages
	 * @param timeout - optional, the timeout to wait for the game to start
	 * @param roomId - optional, the room id for spectate or join private game
	 */
	static async gameRunningTest(
		page: Page,
		screenshotName: string,
		gameSelection: string[],
		expectedWebsocketMessages: string[],
		timeout: number = 1000,
		roomId: string = "",
	) {
		await page.locator("#pong").click();

		//setup websocket message collection
		let webSocketMessages: string[] = [];
		page.on("websocket", (ws) => {
			console.log(`🔌 WEBSOCKET: ${ws.url()}`);
			ws.on("framereceived", (data) => {
				const message = data.payload.toString();
				webSocketMessages.push(message);
			});
		});

		//start game
		await TestingUtils.clickMenuButtons(page, gameSelection);
		await page.waitForTimeout(timeout);
		await page.screenshot({
			path: `ete_tests/screenshots/${screenshotName}.png`,
		});

		//check if game is running
		expect(
			TestingUtils.findSubstrings(
				webSocketMessages,
				expectedWebsocketMessages,
			),
		).toBe(true);
	}

	static async messageSent(page: Page) {}

	static findSubstrings(array: string[], substrings: string[]): boolean {
		return substrings.every((substring) =>
			array.some((str) => str.includes(substring)),
		);
	}
}
