import { test, expect } from "@playwright/test";
import { homeUrl } from "./config";
import { ElementTest } from "./elementsTest";

test("Guest first view", async ({ page }) => {
	await page.goto(homeUrl);
	await expect(page).toHaveURL(`${homeUrl}/sign-in-view`);
	const header = page.getByRole("heading");
	await expect(header).toHaveText("Sign in to your account");
	await ElementTest.labelTest(page, "Your Username");
	await ElementTest.labelTest(page, "Your Password");
	await ElementTest.buttonTest(page, "Sign in");
});
