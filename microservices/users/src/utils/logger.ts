import pino from "pino";
import type { FastifyRequest } from "fastify";

const PINO_LOGGER = true; // Change to true to enable full Pino logging
const FASTIFY_LOGGER = false; // Change to false to disable Fastify logger
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const NODE_ENV = process.env.NODE_ENV || "development";

let internalLogger: pino.Logger;

if (PINO_LOGGER) {
	internalLogger = pino({
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

// Fallback to console.* when PINO_LOGGER is false
function wrap(method: "info" | "warn" | "error" | "debug" | "fatal") {
	return (...args: any[]) => {
		if (PINO_LOGGER) {
			if (!args.length) return;

			let msg: string | undefined;
			let structuredLog: Record<string, unknown> = {};
			let argCounter = 1;

			const first = args[0];
			const rest = args.slice(1);

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
