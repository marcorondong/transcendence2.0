import axios from "axios";
import { setTimeout as delay } from "timers/promises";
import { logPlain, logSuccess, logError, logObject } from "./logger";

const DETAILED_SUMMARY = true; // For printing detailed summary (simple + failed objects)

// TODO: Check how can I implement this notation for functions;
// without cluttering too much not inhering code reading for others

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
): Promise<{
	// Summary variables
	successCount: number;
	failureCount: number;
	failedIndices: number[];
	failedRecords: Record<string, any>[];
}> {
	let successCount = 0;
	let failureCount = 0;
	const failedIndices: number[] = [];
	const failedRecords: Record<string, any>[] = [];

	for (let i = 0; i < data.length; i++) {
		const record = data[i];
		logPlain(`\n📤 Sending record [${i + 1}/${data.length}] to ${url}`);
		logObject(record, { depth: null, colors: true });

		try {
			const response = await axios.post(url, record);
			logSuccess?.(`✅ Success — status: ${response.status}`);
			successCount++;
		} catch (err: any) {
			const status = err.response?.status ?? "?";
			const message = err.response?.data?.message ?? err.message;
			logError?.(`❌ Error — ${status} ${message}`);
			failureCount++;
			failedIndices.push(i);
			failedRecords.push(record);
		}

		if (delayMs > 0 && i < data.length - 1) {
			await delay(delayMs);
		}
	}
	logPlain("\n📊 Summary:");
	logPlain(`   ✔️  ${successCount} succeeded`);
	logPlain(`   ❌  ${failureCount} failed`);

	if (failureCount > 0) {
		logError(`   🔢 Failed indices: ${failedIndices.join(", ")}`);
		if (DETAILED_SUMMARY) {
			logError(`\n🧾 Failed Records:`);
			for (const r of failedRecords) {
				logObject(r, { depth: null, colors: true });
			}
		}
	}

	return {
		successCount,
		failureCount,
		failedIndices,
		failedRecords,
	};
}
