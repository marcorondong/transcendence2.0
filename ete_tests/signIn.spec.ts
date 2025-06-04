import { test, expect } from "@playwright/test";
import { homeUrl } from "./config";

test("Guest first view", async ({ page }) => {
	await page.goto(homeUrl);
	await expect(page).toHaveURL(`${homeUrl}/sign-in-view`);
	const header = page.getByRole("heading");
	await expect(header).toHaveText("Sign in to your account");
	const userInput = page.getByLabel("Your Username");
	await expect(userInput).toBeVisible();
	const passwordLabel = page.getByLabel("Your Password");
	await expect(passwordLabel).toBeVisible();
	const signInButton = page.getByRole("button", { name: "Sign in" });
	await expect(signInButton).toBeVisible();
	await signInButton.click();
});
