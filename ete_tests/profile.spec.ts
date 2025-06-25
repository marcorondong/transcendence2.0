import { test, expect, Page } from "@playwright/test";
import { homeUrl, registeredUsers } from "./config";
import { TestingUtils } from "./TestingUtils";

test("Profile edit and reset", async ({ page }) => {
	await page.goto(homeUrl);
	TestingUtils.logInStep(page, registeredUsers.user1);
	await page.getByRole("link", { name: "profile" }).click();
	await expect(page.getByText(registeredUsers.user1.username)).toBeVisible(); //fseles
	await expect(
		page.locator("#content").getByText(registeredUsers.user1.nickname),
	).toBeVisible(); //sekula
	await expect(page.getByText(registeredUsers.user1.email)).toBeVisible();
	await page.locator("#editButton").click();
	await page.locator("#uploadLabel").click();
	// await page.locator("body").setInputFiles("magare.jpg");
	await page.getByRole("button", { name: "save" }).click();
	await page.getByRole("link", { name: "profile" }).click();
	await page.locator("#editButton").click();
	await page.getByRole("textbox").first().click();
	await page.getByRole("textbox").first().fill("ficekmicekpicek");
	await page.locator('input[type="email"]').click();
	await page.locator('input[type="email"]').fill("f2@gmail.com");
	await page.getByRole("button", { name: "save" }).click();
	await page.getByRole("link", { name: "profile" }).click();
	await expect(page.getByRole("article")).toContainText("ficekmicekpicek");
	await expect(page.getByRole("article")).toContainText("f2@gmail.com");
	await expect(page.getByRole("article")).toContainText(
		registeredUsers.user1.username,
	);
	await page.screenshot({
		path: `ete_tests/screenshots/alterProfile.png`,
	});

	await TestingUtils.resetUser(page, registeredUsers.user1);
	await page.getByRole("link", { name: "profile" }).click();
	await page.screenshot({
		path: `ete_tests/screenshots/reset.png`,
	});
});
