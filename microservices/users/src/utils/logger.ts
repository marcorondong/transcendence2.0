import pino from "pino";
import type { FastifyRequest } from "fastify";
import util from "util"; // For handles %s, %d, %j, etc as console.log()

const PINO_LOGGER = true; // Change to true to enable full Pino logging
const FASTIFY_LOGGER = false; // Change to false to disable Fastify logger
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const NODE_ENV = process.env.NODE_ENV || "development";
const SHOW_CALL_SITE = true; // Enable call_site (function, file, line) in debug and trace logs
const LOG_STACK_TRACE = false; // Enable trace in debug, error and fatal logs
const SERVICE_NAME = "users"; // Optional: leave empty string to skip including in logs

let internalLogger: pino.Logger;

if (PINO_LOGGER) {
	internalLogger = pino({
		base: SERVICE_NAME ? { service: SERVICE_NAME } : {},
		level: LOG_LEVEL,
		transport:
			NODE_ENV === "development"
				? {
						target: "pino-pretty",
						options: {
							colorize: true,
							translateTime: "SYS:standard",
							ignore: "pid,hostname",
						},
				  }
				: undefined,
	});
}

// Helper function to wrap()
function getCallSiteDetails(depth = 3) {
	const stack = new Error().stack?.split("\n");
	if (!stack || stack.length <= depth) return {};

	const line = stack[depth].trim();
	const match =
		line.match(/at\s+(.*)\s+\((.*):(\d+):\d+\)/) ||
		line.match(/at\s+(.*):(\d+):\d+/);

	if (match) {
		if (match.length === 4) {
			return {
				function: match[1],
				file: match[2].split("/").pop(),
				line: parseInt(match[3], 10),
			};
		}
		if (match.length === 3) {
			return {
				file: match[1].split("/").pop(),
				line: parseInt(match[2], 10),
			};
		}
	}
	return {};
}

// Helper function to fallback to console.* when PINO_LOGGER is false
function wrap(method: "info" | "warn" | "error" | "debug" | "fatal" | "trace") {
	return (...args: any[]) => {
		if (!args.length) return;

		if (PINO_LOGGER) {
			let msg: string | undefined;
			let structuredLog: Record<string, unknown> = {};
			let argCounter = 1;

			const first = args[0];
			const rest = args.slice(1);

			// Handle format string (%s, %d, etc.)
			if (typeof first === "string" && /%[sdj%]/.test(first)) {
				msg = util.format(first, ...rest);
			} else {
				if (typeof first === "string") {
					msg = first;
				} else if (first && typeof first === "object") {
					structuredLog = { ...structuredLog, ...first };
				} else {
					structuredLog[`arg${argCounter++}`] = first;
				}

				for (const arg of rest) {
					if (arg && typeof arg === "object" && !Array.isArray(arg)) {
						structuredLog = { ...structuredLog, ...arg };
					} else {
						structuredLog[`arg${argCounter++}`] = arg;
					}
				}
			}

			// Stack trace & call_site logic
			const isTrace = method === "trace";
			const isDebug = method === "debug";
			const isError = method === "error";
			const isFatal = method === "fatal";

			if (SHOW_CALL_SITE && (isTrace || isDebug)) {
				Object.assign(structuredLog, getCallSiteDetails(4));
			}

			if (
				isTrace ||
				(LOG_STACK_TRACE && (isDebug || isError || isFatal))
			) {
				structuredLog.stack = new Error().stack;
			}

			if (Object.keys(structuredLog).length) {
				(internalLogger[method] as (...a: any[]) => void)(
					structuredLog,
					msg,
				);
			} else {
				(internalLogger[method] as (...a: any[]) => void)(msg);
			}
		} else {
			const consoleMethod = method === "info" ? "log" : method;
			(console as any)[consoleMethod](...args);
		}
	};
}

export const logger = {
	info: wrap("info"),
	warn: wrap("warn"),
	error: wrap("error"),
	debug: wrap("debug"),
	trace: wrap("trace"),
	fatal: wrap("fatal"),
	log: wrap("info"), // Alias to mimic console.log

	/**
	 * Wraps Fastify's per-request logger (req.log)
	 * Preserves requestId, method, url
	 */
	from(req: FastifyRequest) {
		return req.log;
	},
};

/**
 * Provides Fastify-compatible logger configuration.
 * Use this when initializing Fastify to keep logging centralized.
 */
export function fastifyLoggerConfig() {
	if (!FASTIFY_LOGGER || !PINO_LOGGER) return false;

	return {
		level: LOG_LEVEL,
		transport:
			NODE_ENV === "development"
				? {
						target: "pino-pretty",
						options: {
							colorize: true,
							translateTime: "SYS:standard",
							ignore: "pid,hostname",
						},
				  }
				: undefined,
	};
}
