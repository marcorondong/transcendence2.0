import type { InspectOptions } from "util";

// MR_NOTE: FG: Foreground. BG: Background

const RESET = "\x1b[0m";
const FG_GREEN = "\x1b[32m";
const FG_RED = "\x1b[31m";
const FG_YELLOW = "\x1b[33m";
const FG_BLUE = "\x1b[34m";

export function logPlain(message: string): void {
	console.log(`${message}`);
}

export function logSuccess(message: string): void {
	console.log(`${FG_GREEN}${message}${RESET}`);
}

export function logError(message: string): void {
	console.error(`${FG_RED}${message}${RESET}`);
}

export function logInfo(message: string): void {
	console.log(`${FG_BLUE}${message}${RESET}`);
}

export function logWarn(message: string): void {
	console.warn(`${FG_YELLOW}${message}${RESET}`);
}

export function logObject(obj: any, options?: InspectOptions): void {
	console.dir(obj, options);
}
