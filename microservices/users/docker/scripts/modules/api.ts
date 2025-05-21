import axios from "axios";
import { setTimeout as delay } from "timers/promises";
import { logSuccess, logError } from "./logger"; // optional utility

/**
 * Sends a list of records to a single API endpoint, one-by-one.
 *
 * @param data - Array of objects to send.
 * @param url - API endpoint URL.
 * @param delayMs - Optional delay (in ms) between requests.
 */
export async function sendDataToApi(
	data: Record<string, any>[],
	url: string,
	delayMs = 0,
): Promise<void> {
	for (let i = 0; i < data.length; i++) {
		const record = data[i];
		console.log(`\n📤 Sending record [${i + 1}/${data.length}] to ${url}`);
		console.dir(record, { depth: null, colors: true });

		try {
			const response = await axios.post(url, record);
			logSuccess?.(`✅ Success — status: ${response.status}`);
		} catch (err: any) {
			const status = err.response?.status ?? "?";
			const message = err.response?.data?.message ?? err.message;
			logError?.(`❌ Error — ${status} ${message}`);
		}

		if (delayMs > 0 && i < data.length - 1) {
			await delay(delayMs);
		}
	}
}
