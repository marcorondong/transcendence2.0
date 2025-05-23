import type { InspectOptions } from "util";
import { appendFileSync } from "fs";

// MR_NOTE: FG: Foreground. BG: Background
const RESET = "\x1b[0m";
const FG_GREEN = "\x1b[32m";
const FG_RED = "\x1b[31m";
const FG_YELLOW = "\x1b[33m";
const FG_BLUE = "\x1b[34m";

let silent = false;
let summaryPath: string | null = null;

export function initLogger(config: {
	silent: boolean;
	summaryPath: string | null;
}) {
	silent = config.silent;
	summaryPath = config.summaryPath;
}

function formatTimestamp(): string {
	return new Date().toISOString(); // E.g. 2025-05-23T17:40:12.123Z
}

function writeToSummary(level: string, message: string) {
	if (!summaryPath) return;
	const line = `${formatTimestamp()} [${level.toUpperCase()}] ${message}\n`;
	try {
		appendFileSync(summaryPath, line);
	} catch (err) {
		console.error(
			`❌ Failed to write log to summary file: ${(err as Error).message}`,
		);
	}
}

export function logPlain(message: string): void {
	if (!silent) console.log(`${message}`);
	writeToSummary("plain", message);
}

export function logSuccess(message: string): void {
	const formatted = `${FG_GREEN}${message}${RESET}`;
	if (!silent) console.log(formatted);
	writeToSummary("success", message);
}

export function logError(message: string): void {
	const formatted = `${FG_RED}${message}${RESET}`;
	console.error(formatted); // Always show errors
	writeToSummary("error", message);
}

export function logInfo(message: string): void {
	const formatted = `${FG_BLUE}${message}${RESET}`;
	if (!silent) console.log(formatted);
	writeToSummary("info", message);
}

export function logWarn(message: string): void {
	const formatted = `${FG_YELLOW}${message}${RESET}`;
	if (!silent) console.warn(formatted);
	writeToSummary("warn", message);
}

export function logObject(obj: any, options?: InspectOptions): void {
	const json = JSON.stringify(obj, null, 2);
	if (!silent) console.dir(obj, options);
	writeToSummary("object", json);
}
