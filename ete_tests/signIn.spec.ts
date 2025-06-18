import { test, expect } from "@playwright/test";
import { homeUrl } from "./config";

test.use({
	ignoreHTTPSErrors: true,
});

test("Home page visibility test", async ({ page }) => {
	await page.goto(homeUrl);
	await expect(
		page.getByRole("textbox", { name: "Your Username" }),
	).toBeVisible();
	await expect(
		page.getByRole("textbox", { name: "Your Password" }),
	).toBeVisible();
	await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Sign up", exact: true }),
	).toBeVisible();
	await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Sign Up", exact: true }),
	).toBeVisible();
	await expect(
		page.locator("theme-toggle-component").getByRole("button"),
	).toBeVisible();
});

test("Sign in without account", async ({ page }) => {
	await page.goto(`${homeUrl}`);
	await page.getByRole("textbox", { name: "Your Username" }).dblclick();
	await page.getByRole("textbox", { name: "Your Username" }).fill("pwguest");
	await page.getByRole("textbox", { name: "Your Username" }).press("Tab");
	await page
		.getByRole("textbox", { name: "Your Password" })
		.fill("Password!234");
	const button = await page.getByRole("button", { name: "Sign in" });
	// await page.getByRole("button", { name: "Sign in" }).click();
	const [response] = await Promise.all([
		page.waitForResponse((res) => res.url().includes("/auth-api/sign-in")), //wait for response where url contains this
		button.click(),
	]);

	expect(response.status()).toBe(401);
	await expect(page.getByText("sign in failed")).toBeVisible();
});

test("Sign up page first view. Not logged", async ({ page }) => {
	await page.goto("https://localhost:8080/sign-in-view");
	await page.getByRole("link", { name: "Sign Up", exact: true }).click();
	await expect(
		page.getByRole("textbox", { name: "Your Username" }),
	).toBeVisible();
	await expect(
		page.getByRole("textbox", { name: "Your Password" }),
	).toBeVisible();
	await expect(
		page.getByRole("textbox", { name: "Repeat Password" }),
	).toBeVisible();
	await expect(
		page.getByRole("textbox", { name: "Your Email" }),
	).toBeVisible();
	await expect(
		page.getByRole("textbox", { name: "Your Nickname" }),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Register new account" }),
	).toBeVisible();
});
