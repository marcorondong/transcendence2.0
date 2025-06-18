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
		await expect(homePage.locator("pong-component")).toContainText(
			"Room Id:",
		);
	}

	static async gameRunningTest(page: Page) {
		await page.waitForTimeout(2000);
		await expect(page.locator("canvas")).toBeVisible();
		// console.log(await page.locator("pong-component").innerText());
		await page.screenshot({ path: "Random Game.png" });
	}
}
