import pino from "pino";
import type { FastifyRequest } from "fastify";
import util from "util"; // For handling %s, %d, %j, etc as console.log()

// === CONFIGURABLE CONSTANTS === //
// Logger format section
let PINO_LOGGER = true; // Change to true to enable full Pino logging
const FASTIFY_LOGGER = true; // Change to false to disable Fastify logger
const LOG_LEVEL = process.env.LOG_LEVEL || "trace";
const NODE_ENV = process.env.NODE_ENV || "development";
// Tracing section
const SHOW_CALL_SITE = true; // Enable call_site (function, file, line) in debug and trace logs
const CALL_SITE_DEPTH_OVERRIDE = null; // Set a number (e.g. 5) to override, or keep null to auto
const LOG_STACK_TRACE = false; // Enable trace in debug, error and fatal logs
const SERVICE_NAME = "users"; // Optional: leave empty string to skip including in logs
// ELK format section
const USE_ELK_FORMAT = true; // Toggle ELK-style arg order: (data, message)
const DEFAULT_LOG_MESSAGE = "<no message>"; // Default fallback if no msg
const ELK_WARN_ENABLED = true; // Set to false to suppress non-ELK format warnings
type InternalLogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal"; // Helper type to set level of non-ELK warning message
const ELK_WARN_LEVEL: InternalLogLevel = "warn"; // Can be trace, debug, fatal, etc.

// Helper function to check if pino-pretty is installed
function isPinoPrettyAvailable(): boolean {
	try {
		require.resolve("pino-pretty");
		return true;
	} catch {
		return false;
	}
}

// Set up logger
let internalLogger: pino.Logger;
// If user (programmer) wants logs formatted using pino
// E.g: {"level":30,"time":1749489540326,"service":"users","msg":"[Config] Loading config..."})
if (PINO_LOGGER) {
	try {
		internalLogger = pino({
			base: SERVICE_NAME ? { service: SERVICE_NAME } : {},
			level: LOG_LEVEL,
			transport:
				NODE_ENV === "development" && isPinoPrettyAvailable()
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
	} catch (err: any) {
		console.warn(
			"[Logger] Failed to initialize pino-pretty. Falling back to console.*().",
			err?.message ?? err,
		);
		PINO_LOGGER = false; // Disable Pino usage to fallback
	}
}

// Helper function for wrap() to get call_site (where the log was triggered)
function getCallSiteDetails(): Record<string, unknown> {
	const stack = new Error().stack?.split("\n");
	if (!stack) return {};

	const startDepth = 2; // Skip Error() and wrap()
	const maxDepth = 10; // Prevent infinite loop
	const fileExclude = "logger.ts"; // Skip internal logger calls

	const effectiveDepth = (() => {
		if (CALL_SITE_DEPTH_OVERRIDE !== null) return CALL_SITE_DEPTH_OVERRIDE;

		for (let i = startDepth; i < Math.min(stack.length, maxDepth); i++) {
			const line = stack[i].trim();
			if (!line.includes(fileExclude)) return i;
		}
		return startDepth; // fallback if all frames are from logger
	})();

	const line = stack[effectiveDepth]?.trim();
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

// Helper function for wrap() to handle cyclic objects (an object that references itself, directly or indirectly)
function safeStringify(obj: any): string {
	const seen = new WeakSet();
	try {
		return JSON.stringify(obj, (_key, value) => {
			if (typeof value === "object" && value !== null) {
				if (seen.has(value)) return "[Circular]";
				seen.add(value);
			}
			return value;
		});
	} catch {
		return "[Unserializable]";
	}
}

// Helper function to fallback to console.* when PINO_LOGGER is false
function wrap(method: "trace" | "debug" | "info" | "warn" | "error" | "fatal") {
	return (...args: any[]) => {
		if (!args.length) return;

		// If user (programmer) wants logs "pino formatted"
		if (PINO_LOGGER) {
			let msg: string | undefined;
			let structuredLog: Record<string, unknown> = {};
			let argCounter = 1;

			const first = args[0];
			const rest = args.slice(1);

			// FORMAT STRING CASE (%s, %d, etc.)
			if (typeof first === "string" && /%[sdj%]/.test(first)) {
				const safeArgs = rest.map((arg) =>
					typeof arg === "object" && arg !== null
						? safeStringify(arg)
						: arg,
				);
				msg = util.format(first, ...safeArgs);
			} else {
				const objects: Record<string, unknown>[] = [];
				const others: any[] = [];

				for (const arg of args) {
					if (arg && typeof arg === "object" && !Array.isArray(arg)) {
						objects.push(arg);
					} else {
						others.push(arg);
					}
				}

				structuredLog = Object.assign({}, ...objects);

				// Fallback logic for message
				const stringArgs = args.filter((a) => typeof a === "string");
				const fallbackMsg = stringArgs[stringArgs.length - 1];

				if (USE_ELK_FORMAT) {
					if (
						args.length >= 2 &&
						typeof args[0] === "object" &&
						typeof args[1] === "string"
					) {
						msg = args[1];
					} else if (typeof fallbackMsg === "string") {
						msg = fallbackMsg;

						const isSingleStringArg =
							args.length === 1 && typeof args[0] === "string";

						if (
							!isSingleStringArg &&
							typeof args[0] === "string" &&
							ELK_WARN_ENABLED
						) {
							internalLogger[ELK_WARN_LEVEL](
								{
									source: "logger",
									message:
										"[Logger] Expected (object, message) for ELK logs. Got (string, ...)",
								},
								"[Logger] Expected (object, message) for ELK logs. Got (string, ...)",
							);
						}
					}

					// Ensure message field exists
					if (!structuredLog.message && msg) {
						structuredLog.message = msg;
					}
					if (!msg && typeof structuredLog.message === "string") {
						msg = structuredLog.message;
					}
				} else {
					// DEV-FRIENDLY format (message first)
					if (typeof args[0] === "string") {
						msg = args[0];
					}
					if (!structuredLog.message) {
						structuredLog.message = msg || DEFAULT_LOG_MESSAGE;
					}
					if (!msg && typeof structuredLog.message === "string") {
						msg = structuredLog.message;
					}
				}

				// Add remaining primitives
				for (const other of others) {
					if (
						typeof other !== "object" &&
						other !== msg // skip if already used as msg
					) {
						structuredLog[`arg${argCounter++}`] = other;
					}
				}
			}

			// Always include source tag
			structuredLog.source = "console";

			// Add call_site/stack logic
			const isTrace = method === "trace";
			const isDebug = method === "debug";
			const isError = method === "error";
			const isFatal = method === "fatal";

			if (SHOW_CALL_SITE && (isTrace || isDebug)) {
				Object.assign(structuredLog, getCallSiteDetails());
			}
			if (
				isTrace ||
				(LOG_STACK_TRACE && (isDebug || isError || isFatal))
			) {
				structuredLog.stack = new Error().stack;
			}

			(internalLogger[method] as (...a: any[]) => void)(
				structuredLog,
				msg || DEFAULT_LOG_MESSAGE,
			);
			// Plain old console.log console.warn, console.error
		} else {
			const consoleMethod = method === "info" ? "log" : method;
			if (typeof (console as any)[consoleMethod] === "function") {
				(console as any)[consoleMethod](...args);
			} else {
				console.error(...args);
			}
		}
	};
}

// logger (main) function
export const logger = {
	trace: wrap("trace"),
	debug: wrap("debug"),
	info: wrap("info"),
	warn: wrap("warn"),
	error: wrap("error"),
	fatal: wrap("fatal"),
	log: wrap("info"), // Alias to mimic console.log

	// Wraps Fastify's per-request logger (req.log). Preserves requestId, method, url
	from(request: FastifyRequest) {
		const wrapRequestLog = (
			method: "trace" | "debug" | "info" | "warn" | "error" | "fatal",
		) => {
			return (...args: any[]) => {
				if (!args.length) return;

				const [maybeObj, maybeMsg] = args;
				if (
					typeof maybeObj === "object" &&
					!Array.isArray(maybeObj) &&
					maybeObj !== null
				) {
					request.log[method](
						{ ...maybeObj, source: "request" },
						typeof maybeMsg === "string" ? maybeMsg : undefined,
					);
				} else {
					request.log[method]({ source: "request" }, ...args);
				}
			};
		};

		return {
			trace: wrapRequestLog("trace"),
			debug: wrapRequestLog("debug"),
			info: wrapRequestLog("info"),
			warn: wrapRequestLog("warn"),
			error: wrapRequestLog("error"),
			fatal: wrapRequestLog("fatal"),
			log: wrapRequestLog("info"),
		};
	},
	console: (...args: any[]) => console.log(...args),
};

// Provides Fastify-compatible logger configuration. (Use when initializing Fastify)
export function fastifyLoggerConfig() {
	if (!FASTIFY_LOGGER) return false;

	let transport;
	if (NODE_ENV === "development") {
		// If pino-pretty is installed, fill 'transport' with custom pino-pretty formatting
		if (isPinoPrettyAvailable()) {
			transport = {
				target: "pino-pretty",
				options: {
					colorize: true,
					translateTime: "SYS:standard",
					ignore: "pid,hostname",
				},
			};
		} else {
			console.warn(
				"[FastifyLogger] pino-pretty not found. Using raw logs.",
			);
		}
	}
	// Return the correct 'transport' (if pino-pretty installed, or not)
	return {
		level: LOG_LEVEL,
		transport,
	};
}
