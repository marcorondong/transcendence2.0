import { Page, expect } from "@playwright/test";

export class DebugUtils {
	/**
	 * Set up comprehensive logging for a page
	 */
	static setupLogging(page: Page) {
		// Network requests
		page.on("request", (request) => {
			console.log(`🚀 REQUEST: ${request.method()} ${request.url()}`);
			if (request.postData()) {
				console.log(`📤 POST DATA: ${request.postData()}`);
			}
			if (request.headers()) {
				console.log(
					`📋 HEADERS: ${JSON.stringify(request.headers(), null, 2)}`,
				);
			}
		});

		page.on("response", (response) => {
			console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
			if (response.status() >= 400) {
				console.log(
					`❌ ERROR RESPONSE: ${response.status()} ${response.statusText()}`,
				);
			}
		});

		// Console messages
		page.on("console", (msg) => {
			console.log(`🔍 CONSOLE: ${msg.type()}: ${msg.text()}`);
		});

		// Page errors
		page.on("pageerror", (error) => {
			console.log(`💥 PAGE ERROR: ${error.message}`);
			console.log(`💥 STACK: ${error.stack}`);
		});

		// Dialogs
		page.on("dialog", (dialog) => {
			console.log(`💬 DIALOG: ${dialog.type()}: ${dialog.message()}`);
			dialog.dismiss();
		});

		// WebSocket messages
		page.on("websocket", (ws) => {
			console.log(`🔌 WEBSOCKET: ${ws.url()}`);
			ws.on("framesent", (data) => console.log(`📤 WS SENT: ${data}`));
			ws.on("framereceived", (data) =>
				console.log(`📥 WS RECEIVED: ${data}`),
			);
		});
	}

	/**
	 * Take a screenshot with timestamp
	 */
	static async takeScreenshot(page: Page, name: string) {
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const filename = `ete_tests/screenshots/${name}_${timestamp}.png`;
		await page.screenshot({ path: filename, fullPage: true });
		console.log(`📸 Screenshot saved: ${filename}`);
		return filename;
	}

	/**
	 * Log detailed information about an element
	 */
	static async logElementInfo(page: Page, selector: string, label: string) {
		try {
			const element = page.locator(selector);
			const isVisible = await element.isVisible();
			const isEnabled = await element.isEnabled();
			const text = await element.innerText();
			const tagName = await element.evaluate((el) => el.tagName);
			const className = await element.evaluate((el) => el.className);

			console.log(`🔍 ${label}:`);
			console.log(`   - Visible: ${isVisible}`);
			console.log(`   - Enabled: ${isEnabled}`);
			console.log(`   - Text: "${text}"`);
			console.log(`   - Tag: ${tagName}`);
			console.log(`   - Class: ${className}`);
		} catch (e) {
			console.log(`❌ Could not get info for ${label}: ${e}`);
		}
	}

	/**
	 * Wait for network idle and log any pending requests
	 */
	static async waitForNetworkIdle(page: Page, timeout = 5000) {
		console.log(`⏳ Waiting for network idle (${timeout}ms)...`);
		try {
			await page.waitForLoadState("networkidle", { timeout });
			console.log(`✅ Network is idle`);
		} catch (e) {
			console.log(`⚠️ Network did not become idle within ${timeout}ms`);
		}
	}

	/**
	 * Log current page state
	 */
	static async logPageState(page: Page) {
		const url = page.url();
		const title = await page.title();
		const content = await page.content();

		console.log(`📄 PAGE STATE:`);
		console.log(`   - URL: ${url}`);
		console.log(`   - Title: ${title}`);
		console.log(`   - Content length: ${content.length} characters`);
		console.log(`   - Content preview: ${content.substring(0, 200)}...`);
	}

	/**
	 * Debug a specific button click with detailed logging
	 */
	static async debugButtonClick(
		page: Page,
		buttonSelector: string,
		buttonName: string,
	) {
		console.log(`🔍 DEBUGGING BUTTON: ${buttonName}`);

		// Log element info before click
		await this.logElementInfo(
			page,
			buttonSelector,
			`Button "${buttonName}" before click`,
		);

		// Take screenshot before click
		await this.takeScreenshot(
			page,
			`before_${buttonName.replace(/\s+/g, "_")}_click`,
		);

		// Wait for any animations or state changes
		await page.waitForTimeout(500);

		// Perform the click
		console.log(`🖱️ Clicking button: ${buttonName}`);
		await page.locator(buttonSelector).click();

		// Wait for network idle
		await this.waitForNetworkIdle(page);

		// Take screenshot after click
		await this.takeScreenshot(
			page,
			`after_${buttonName.replace(/\s+/g, "_")}_click`,
		);

		// Log page state after click
		await this.logPageState(page);
	}

	/**
	 * Monitor for specific text or elements to appear
	 */
	static async waitForTextWithTimeout(
		page: Page,
		text: string,
		timeout = 10000,
	) {
		console.log(`⏳ Waiting for text: "${text}" (${timeout}ms timeout)`);
		try {
			await page.waitForSelector(`text="${text}"`, { timeout });
			console.log(`✅ Text found: "${text}"`);
			return true;
		} catch (e) {
			console.log(`❌ Text not found within ${timeout}ms: "${text}"`);
			return false;
		}
	}

	/**
	 * Log all buttons on the current page
	 */
	static async logAllButtons(page: Page) {
		const buttons = await page.locator("button").all();
		console.log(`🔍 Found ${buttons.length} buttons on page:`);

		for (let i = 0; i < buttons.length; i++) {
			try {
				const text = await buttons[i].innerText();
				const isVisible = await buttons[i].isVisible();
				const isEnabled = await buttons[i].isEnabled();
				console.log(
					`   ${
						i + 1
					}. "${text}" - Visible: ${isVisible}, Enabled: ${isEnabled}`,
				);
			} catch (e) {
				console.log(`   ${i + 1}. [Error getting button info: ${e}]`);
			}
		}
	}
}
