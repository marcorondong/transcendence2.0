import { test, expect } from "@playwright/test";
import { homeUrl } from "./config";

// random username generator
const randomString = () => Math.random().toString(36).substring(2, 15);
const username = "tester" + randomString().replaceAll(/[0-9]/g, "");
const password = randomString() + "A1!"; // to comply with our password policy
const email = username + "@example.com";
const nickname = username + "_nick";

test.describe.serial("sign up test", () => {
	const fillSignUpForm = async (
		page,
		username,
		password,
		email,
		nickname,
	) => {
		await page.getByRole("link", { name: "Sign up", exact: true }).click();
		await page
			.getByRole("textbox", { name: "Your Username" })
			.fill(username);
		await page
			.getByRole("textbox", { name: "Your Password" })
			.fill(password);
		await page
			.getByRole("textbox", { name: "Repeat Password" })
			.fill(password);
		await page.getByRole("textbox", { name: "Your Email" }).fill(email);
		await page
			.getByRole("textbox", { name: "Your Nickname" })
			.fill(nickname);
		await page
			.getByRole("button", { name: "Register new account" })
			.click();
	};

	test("can sign up and sign in automatically", async ({ page }) => {
		await page.goto(homeUrl);
		await fillSignUpForm(page, username, password, email, nickname);
		await expect(page.getByText("You just signed up!")).toBeVisible();
		await expect(page.getByText("chat websocket opened")).toBeVisible();
	});

	test("cant sign up twice with same username", async ({ page }) => {
		await page.goto(homeUrl);
		await fillSignUpForm(
			page,
			username,
			password,
			"asd" + email,
			"asd" + nickname,
		);
		await expect(page.getByText("failed to sign up")).toBeVisible();
	});

	test("cant sign up twice with same email", async ({ page }) => {
		await page.goto(homeUrl);
		await fillSignUpForm(
			page,
			"asd" + username,
			password,
			email,
			"asd" + nickname,
		);
		await expect(page.getByText("failed to sign up")).toBeVisible();
	});

	test("cant sign up twice with same nickname", async ({ page }) => {
		await page.goto(homeUrl);
		await fillSignUpForm(
			page,
			"asd" + username,
			password,
			"asd" + email,
			nickname,
		);
		await expect(page.getByText("failed to sign up")).toBeVisible();
	});

	test("existing user can sign in and sign out", async ({ page }) => {
		await page.goto(homeUrl);
		await page
			.getByRole("textbox", { name: "Your Username" })
			.fill(username);
		await page
			.getByRole("textbox", { name: "Your Password" })
			.fill(password);
		await page
			.getByRole("button", { name: "Sign in", exact: true })
			.click();
		await expect(page.getByText("You just signed in!")).toBeVisible();
		await expect(page.getByText("chat websocket opened")).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Sign out", exact: true }),
		).toBeDefined();
		// delete cookie (sign out)
		await page.context().clearCookies();
		await page.reload();
		await expect(
			page.getByRole("button", { name: "Sign in", exact: true }),
		).toBeVisible();
		await page
			.getByRole("button", { name: "Sign in", exact: true })
			.click();
		await expect(
			page.getByRole("link", { name: "Sign up", exact: true }),
		).toBeVisible();
	});
});
