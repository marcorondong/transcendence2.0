import { Page, expect } from "@playwright/test";

export class ElementTest {
	static async labelTest(page: Page, labelName: string): Promise<void> {
		const userInput = page.getByLabel(labelName);
		await expect(userInput).toBeVisible();
	}

	static async buttonTest(page: Page, buttonName: string): Promise<void> {
		const button = page.getByRole("button", { name: buttonName });
		await expect(button).toBeVisible();
		await button.click();
	}
}
