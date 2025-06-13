import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { logger } from "./logger";
import { AppError, CONFIG_ERRORS } from "./errors";

// === Derive runtime context === //
// If "container", folder structure according to a container.
// If "local", folder structure according to our repo
const RUNNING_ENV = process.env.RUNNING_ENV || "local";
const ROOT_FOLDER_NAME = RUNNING_ENV === "container" ? "/" : "transcendence2.0";
const ENVS_PATH =
	RUNNING_ENV === "container"
		? "./app/docker"
		: "./microservices/users/docker";
const JSON_PATH =
	RUNNING_ENV === "container" ? "./app" : "./microservices/users";
const SECRETS_PATH =
	RUNNING_ENV === "container"
		? "./run/secrets"
		: "./microservices/users/docker/secrets";

function findRoot(startDir = __dirname): string {
	if (ROOT_FOLDER_NAME === "/") return "/";
	let current = startDir;
	while (current !== path.parse(current).root) {
		if (path.basename(current) === ROOT_FOLDER_NAME) {
			return current;
		}
		current = path.dirname(current);
	}
	throw new AppError({
		statusCode: 500,
		code: CONFIG_ERRORS.ROOT_FOLDER,
		message: `Project root ${ROOT_FOLDER_NAME} not found`,
		handlerName: "getConfig",
	});
}

const resolvedRoot = findRoot();

// Function to get resolved path relative to ROOT_FOLDER_NAME (`/` or `transcendence2.0`)
function getPath(relPath: string): string {
	const cleanPath = relPath.replace(/^\.?\/*/, ""); // Remove leading './' or '/'
	// logger.debug(path.resolve(resolvedRoot, cleanPath)); // Comment-in to see resolved path
	return path.resolve(resolvedRoot, cleanPath);
}

// === Load service-specific and shared project env files (if any) === //
// Note that the default is 'path.resolve(process.cwd(), '.env')'
// E.g: dotenv.config({ path: path.resolve(__dirname, "../../.env") });
try {
	const dotenv = require("dotenv");
	dotenv.config({
		path: [
			getPath("./.env"), // Repo-level shared env (adjust as needed)
			getPath(path.join(ENVS_PATH, ".env")), // Service-level env (adjust as needed)
			getPath("./microservices/users/docker/.env"), // Custom path, adjust as needed
		],
		debug: true,
	});
	logger.log(`${process.env.SERVICE_ENV} and ${process.env.ROOT_ENV}`);
} catch (err) {
	logger.error("[dotenv] Threw error:", err);
}

// Function Return type definition (for type safety)
type AppConfig = {
	PAGINATION_ENABLED: string;
	DEFAULT_PAGE_SIZE: string;
	APP_VERSION: string;
	APP_NAME: string;
	APP_DESCRIPTION: string;
	NODE_ENV: string;
	ROOT_ENV: string;
	SERVICE_ENV: string;
	docker_secret: string;
};

// To cache the result of reading files/envs. (initialized once, optimizes performance)
let cachedConfig: AppConfig | null = null;

// Main Function: read and assign config values from Docker secrets, environment or hardcoded values
export default function getConfig(): AppConfig {
	if (cachedConfig) return cachedConfig;

	logger.log("[config] Loading config...");

	// Define hardcoded values here
	const hardcodedDefaults = {
		NODE_ENV: "development",
		PAGINATION_ENABLED: "true",
		DEFAULT_PAGE_SIZE: "10",
		APP_VERSION: "1.0.0",
		APP_NAME: "ft_transcendence",
		APP_DESCRIPTION: "User service API",
		ROOT_ENV: "Not Found", // For testing
		SERVICE_ENV: "Not Found", // For testing
		docker_secret: "Not Found", // For testing
	};

	// Load values from package..json (or any other json)
	const pkg = (() => {
		try {
			const pkgPath = getPath(path.join(JSON_PATH, "package.json"));
			return JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
		} catch (err) {
			logger.warn("[config] Could not load package.json:", err);
			// Optional: throw an error?
			// throw new AppError({
			// 	statusCode: 500,
			// 	code: CONFIG_ERRORS.NOT_FOUND,
			// 	message: "[config] Could not load package.json:",
			// 	handlerName: "getConfig",
			// });
		}
		return {};
	})();

	// Load values from Docker-style secrets
	const loadSecret = (key: string | undefined): string | undefined => {
		logger.log("[config] loadSecret() called for key:", key);
		if (!key) return undefined;
		const candidates = [
			getPath(path.join(SECRETS_PATH, key.toLowerCase() + ".txt")), // local
			getPath(path.join(SECRETS_PATH, key.toLowerCase())), // container
		];
		for (const filePath of candidates) {
			try {
				if (fs.existsSync(filePath)) {
					return fs.readFileSync(filePath, "utf-8").trim();
				}
			} catch (err) {
				logger.warn(
					`[config] Failed to read secret ${key} at ${filePath}:`,
					err,
				);
				// Optional: throw an error?
				// throw new AppError({
				// 	statusCode: 500,
				// 	code: CONFIG_ERRORS.NOT_FOUND,
				// 	message: `[config] Failed to read secret ${key}:`,
				// 	handlerName: "getConfig",
				// });
			}
		}
		return undefined;
	};

	function resolveConfigValue<T>(
		key: string,
		sources: [string, T | undefined | null][],
	): T {
		for (const [sourceName, value] of sources) {
			// If value DO exist (it's not undefined, null)
			if (value != null) {
				logger.log(
					`[config] ${key} = ${value} Loaded from ${sourceName}`,
				);
				return value;
			}
		}
		logger.warn(`[config] ${key} is missing in all sources`);
		// Optional: throw an error?
		throw new AppError({
			statusCode: 500,
			code: CONFIG_ERRORS.NOT_FOUND,
			message: `[config] ${key} is missing in all sources`,
			handlerName: "getConfig",
		});
	}

	// Build config from env + secrets + pkg + fallbacks
	const config: AppConfig = {
		NODE_ENV: resolveConfigValue("NODE_ENV", [
			["secret", loadSecret("NODE_ENV")],
			["env", process.env.NODE_ENV],
			["default", hardcodedDefaults.NODE_ENV],
		]),

		PAGINATION_ENABLED: resolveConfigValue("PAGINATION_ENABLED", [
			["secret", loadSecret("PAGINATION_ENABLED")],
			["env", process.env.PAGINATION_ENABLED],
			["default", hardcodedDefaults.PAGINATION_ENABLED],
		]),

		DEFAULT_PAGE_SIZE: resolveConfigValue("DEFAULT_PAGE_SIZE", [
			["secret", loadSecret("DEFAULT_PAGE_SIZE")],
			["env", process.env.DEFAULT_PAGE_SIZE],
			["default", hardcodedDefaults.DEFAULT_PAGE_SIZE],
		]),

		APP_VERSION: resolveConfigValue("APP_VERSION", [
			["secret", loadSecret("APP_VERSION")],
			["env", process.env.APP_VERSION],
			["package.json", pkg.version],
			["default", hardcodedDefaults.APP_VERSION],
		]),

		APP_NAME: resolveConfigValue("APP_NAME", [
			["secret", loadSecret("APP_NAME")],
			["env", process.env.APP_NAME],
			["package.json", pkg.name],
			["default", hardcodedDefaults.APP_NAME],
		]),

		APP_DESCRIPTION: resolveConfigValue("APP_DESCRIPTION", [
			["secret", loadSecret("APP_DESCRIPTION")],
			["env", process.env.APP_DESCRIPTION],
			["package.json", pkg.description],
			["default", hardcodedDefaults.APP_DESCRIPTION],
		]),
		// For testing
		ROOT_ENV: resolveConfigValue("ROOT_ENV", [
			["env", process.env.ROOT_ENV],
			["default", hardcodedDefaults.ROOT_ENV],
		]),
		// For testing
		SERVICE_ENV: resolveConfigValue("SERVICE_ENV", [
			["env", process.env.SERVICE_ENV],
			["default", hardcodedDefaults.SERVICE_ENV],
		]),
		// For testing
		docker_secret: resolveConfigValue("docker_secret", [
			["secret", loadSecret("docker_secret")],
			["default", hardcodedDefaults.ROOT_ENV],
		]),
	};

	logger.log("[config] Final config object:", config);

	cachedConfig = config; // Cache the config
	return config;
}
