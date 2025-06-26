import { Page, expect } from "@playwright/test";
import { homeUrl, ILogIn, IUserInfo } from "./config";

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
			await TestingUtils.buttonTest(page, buttonName);
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
		await page.locator("#pongLogo").click();
		await page.locator("#pong").click();

		//setup websocket message collection
		let webSocketMessages: string[] = [];
		page.on("websocket", (ws) => {
			console.log(`🔌 WEBSOCKET: ${ws.url()}`);
			ws.on("framereceived", (data) => {
				const message = data.payload.toString();
				webSocketMessages.push(message);
			});
			ws.on("socketerror", (e) => {
				console.error(e);
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

	static async resetUser(page: Page, user: IUserInfo) {
		await page.getByRole("link", { name: "profile" }).click();
		await page.locator("#editButton").click();
		await page.getByRole("textbox").first().dblclick();
		await page.getByRole("textbox").first().fill(user.username); //SEkula
		await page.locator('input[type="email"]').click();
		await page.locator('input[type="email"]').fill(user.email);
		await page.getByRole("button", { name: "save" }).click();
		await page.getByRole("link", { name: "profile" }).click();
	}

	static findSubstrings(array: string[], substrings: string[]): boolean {
		return substrings.every((substring) =>
			array.some((str) => str.includes(substring)),
		);
	}
}
