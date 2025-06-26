import { test, expect, Browser, Page, BrowserContext } from "@playwright/test";
import { homeUrl, registeredUsers } from "./config";
import { TestingUtils } from "./TestingUtils";

test.use({
	ignoreHTTPSErrors: true,
});

test("Back and fort button", async ({ page }) => {
	TestingUtils.logInStep(page, registeredUsers.user1);
	await expect(page.locator("#pong")).toBeVisible();
	await page.getByRole("link", { name: "profile" }).click();
	await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
	await page.goto("https://localhost:8080/");
	await expect(page.locator("#pong")).toBeVisible();
	await page.goto("https://localhost:8080/profile-view");
	await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
});
