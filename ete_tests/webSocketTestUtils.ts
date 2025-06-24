import { Page, expect } from "@playwright/test";

export interface WebSocketMessage {
	timestamp: number;
	type: "sent" | "received";
	data: any;
	url?: string;
}

// Global array to store WebSocket messages
let wsMessages: string[] = [];

/**
 * Set up WebSocket monitoring for a page
 */
export function setupWebSocketMonitoring(page: Page) {
	// Clear previous messages
	wsMessages = [];

	page.on("websocket", (ws) => {
		console.log(`🔌 WebSocket connected: ${ws.url()}`);

		ws.on("framereceived", (data) => {
			console.log(`📥 WS RECEIVED: ${data}`);
			wsMessages.push(data);
		});
	});
}

/**
 * Wait for a specific WebSocket message within a timeout
 */
export async function waitForWebSocketMessage(
	page: Page,
	expectedMessage: string,
	timeout = 10000,
): Promise<string | null> {
	const startTime = Date.now();

	while (Date.now() - startTime < timeout) {
		// Check if the message is in our array
		const foundMessage = wsMessages.find(
			(msg) => typeof msg === "string" && msg.includes(expectedMessage),
		);

		if (foundMessage) {
			console.log(`✅ Found WebSocket message: ${foundMessage}`);
			return foundMessage;
		}

		// Wait a bit before checking again
		await page.waitForTimeout(100);
	}

	console.log(`❌ Expected WebSocket message not found within ${timeout}ms`);
	return null;
}

/**
 * Get all received WebSocket messages
 */
export function getAllWebSocketMessages(): string[] {
	return [...wsMessages];
}

/**
 * Clear all stored WebSocket messages
 */
export function clearWebSocketMessages() {
	wsMessages = [];
}

export class WebSocketTestUtils {
	private wsMessages: WebSocketMessage[] = [];
	private wsConnections: any[] = [];

	/**
	 * Check if a specific message was received via WebSocket
	 */
	hasReceivedMessage(expectedMessage: string | RegExp): boolean {
		return this.wsMessages.some((msg) => {
			if (typeof expectedMessage === "string") {
				return (
					typeof msg.data === "string" &&
					msg.data.includes(expectedMessage)
				);
			} else {
				return (
					typeof msg.data === "string" &&
					expectedMessage.test(msg.data)
				);
			}
		});
	}

	/**
	 * Get all WebSocket messages received
	 */
	getAllMessages(): WebSocketMessage[] {
		return [...this.wsMessages];
	}

	/**
	 * Get messages filtered by type (sent/received)
	 */
	getMessagesByType(type: "sent" | "received"): WebSocketMessage[] {
		return this.wsMessages.filter((msg) => msg.type === type);
	}

	/**
	 * Clear all stored messages
	 */
	clearMessages() {
		this.wsMessages = [];
	}

	/**
	 * Log all WebSocket messages
	 */
	logAllMessages() {
		console.log("📊 All WebSocket Messages:");
		this.wsMessages.forEach((msg, index) => {
			const time = new Date(msg.timestamp).toISOString();
			console.log(
				`  ${index + 1}. [${time}] ${msg.type.toUpperCase()}: ${
					msg.data
				}`,
			);
		});
	}

	/**
	 * Test if "Match Status: Game is running" is received via WebSocket
	 */
	async testMatchStatusWebSocket(page: Page): Promise<boolean> {
		const matchStatusMessage = await this.waitForWebSocketMessage(
			page,
			/Match Status.*Game is running/i,
			10000,
		);

		if (matchStatusMessage) {
			console.log(
				`✅ WebSocket received match status: ${matchStatusMessage}`,
			);
			return true;
		} else {
			console.log("❌ WebSocket did not receive match status message");
			return false;
		}
	}

	/**
	 * Test if "Match Status: Game is running" appears on the page
	 */
	async testMatchStatusOnPage(page: Page): Promise<boolean> {
		try {
			await expect(
				page.getByText("Match Status: Game is running"),
			).toBeVisible({ timeout: 10000 });
			console.log(
				"✅ 'Match Status: Game is running' is visible on the page",
			);
			return true;
		} catch (e) {
			console.log(
				"❌ 'Match Status: Game is running' is NOT visible on the page",
			);
			return false;
		}
	}

	/**
	 * Comprehensive test for the Play Normal AI flow
	 */
	async testPlayNormalAIFlow(page: Page): Promise<{
		wsReceived: boolean;
		pageVisible: boolean;
		messages: WebSocketMessage[];
	}> {
		console.log("🧪 Testing Play Normal AI flow...");

		// Wait for WebSocket message
		const wsReceived = await this.testMatchStatusWebSocket(page);

		// Wait a bit for UI to update
		await page.waitForTimeout(2000);

		// Check if it appears on the page
		const pageVisible = await this.testMatchStatusOnPage(page);

		// Get all messages for analysis
		const messages = this.getAllMessages();

		return {
			wsReceived,
			pageVisible,
			messages,
		};
	}

	/**
	 * Monitor WebSocket activity for a specified duration
	 */
	async monitorWebSocketActivity(
		page: Page,
		durationSeconds: number,
	): Promise<void> {
		console.log(
			`⏱️ Monitoring WebSocket activity for ${durationSeconds} seconds...`,
		);

		const startTime = Date.now();
		const initialMessageCount = this.wsMessages.length;

		for (let i = 0; i < durationSeconds; i++) {
			await page.waitForTimeout(1000);
			const elapsed = i + 1;
			const newMessages = this.wsMessages.length - initialMessageCount;
			console.log(
				`⏱️ ${elapsed}s elapsed, ${newMessages} new WS messages`,
			);
		}

		console.log(
			`📊 Monitoring complete. Total messages: ${this.wsMessages.length}`,
		);
	}
}
