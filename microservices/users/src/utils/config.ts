import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { logger } from "./logger";
import { AppError, CONFIG_ERRORS } from "./errors";

const ROOT_FOLDER_NAME = process.env.ROOT_FOLDER_NAME || "transcendence2.0"; // Set to "/" when running containerized

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

export function getPath(relPath: string): string {
	const cleanPath = relPath.replace(/^\.?\/*/, ""); // Remove leading './' or '/'
	return path.resolve(resolvedRoot, cleanPath);
}

// Load '.env' file (if any)
// dotenv.config({ path: path.resolve(__dirname, "../../.env") });
// Load service-specific and shared project env files (if any)
// dotenv.config({
// 	path: [
// 		path.resolve(__dirname, "../.env"), // Service-level env (adjust as needed)
// 		path.resolve(__dirname, "../../../.env"), // Repo-level shared env (adjust as needed)
// 	],
// });
// TODO: START Testing
try {
	// const result = dotenv.config({
	// 	path: [path.resolve(__dirname, "../../../.env")],
	// 	path: [path.resolve(__dirname, "../../.env")],
	// });
	// const result = dotenv.config({ path: ['.env.local', '.env'] })
	// const result = dotenv.config({
	// 	path: [
	// 		path.resolve(__dirname, "../../../.env"),
	// 		path.resolve(__dirname, "../../.env"),
	// 	],
	// });
	const result = dotenv.config({
		path: [getPath("./.env"), getPath("./microservices/users/.env")],
	});

	logger.log("[dotenv] config result:", result);
	logger.log(
		"(expected: WATA + FACK). process.env.WATA + ",
		process.env.WATA,
	);
	logger.log(
		"(expected: MOTHA + FUKA). process.env.MOTHA + ",
		process.env.MOTHA,
	);
	if (result.error) {
		logger.error("[dotenv] Error loading .env:", result.error);
	} else {
		logger.log("[dotenv] Loaded variables:", result.parsed);
	}
} catch (err) {
	logger.error("[dotenv] Threw error:", err);
}
// TODO: END Testing

// Note that the default is 'path.resolve(process.cwd(), '.env')'
// So 'cwd' is 'pwd'; where I'm located at the moment of running the app.

// Function Return type definition (for type safety)
type AppConfig = {
	PAGINATION_ENABLED: string;
	DEFAULT_PAGE_SIZE: string;
	APP_VERSION: string;
	APP_NAME: string;
	APP_DESCRIPTION: string;
	NODE_ENV: string;
};

// For caching the result of reading files/envs.
// It’s initialized once when getConfig() is first called.
// It optimizes performance, ensures consistency, prevents unnecessary file reads or env parsing multiple times.
let cachedConfig: AppConfig | null = null;

// Function to read and assign config values from Docker secrets, environment or hardcoded values
export default function getConfig(): AppConfig {
	if (cachedConfig) return cachedConfig;

	logger.log("[config] Loading config...");

	const secretsPath = "/run/secrets"; // Docker-style secrets path
	const packageJsonPath = "../../package.json";
	const hasSecretsFolder = fs.existsSync(secretsPath); // For checking if folder exists
	// Define hardcoded values here
	const hardcodedDefaults = {
		PAGINATION_ENABLED: "true",
		DEFAULT_PAGE_SIZE: "10",
		APP_VERSION: "1.0.0",
		APP_NAME: "ft_transcendence",
		APP_DESCRIPTION: "User service API",
		NODE_ENV: "development",
	};

	// TODO: Later make it more versatile (define a constant for the path).
	// or code a function that loads from files (different from loadSecret)
	const pkg = (() => {
		try {
			const pkgPath = path.resolve(__dirname, packageJsonPath);
			return JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
		} catch (err) {
			logger.warn("[config] Could not load package.json:", err);
			return {};
		}
	})();

	// Helper function to load from Docker-style secrets
	const loadSecret = (key: string | undefined): string | undefined => {
		logger.log("[config] loadSecret() called for key:", key);
		if (!key || !hasSecretsFolder) return undefined;
		const filePath = path.join(secretsPath, key.toLowerCase());
		try {
			if (fs.existsSync(filePath)) {
				return fs.readFileSync(filePath, "utf-8").trim();
			}
		} catch (err) {
			logger.warn(`[config] Failed to read secret ${key}:`, err);
			// Optional: throw an error?
			// throw new AppError({
			// 	statusCode: 500,
			// 	code: CONFIG_ERRORS.NOT_FOUND,
			// 	message: `[config] Failed to read secret ${key}:`,
			// 	handlerName: "getConfig",
			// });
		}
		return undefined;
	};

	function resolveConfigValue<T>(
		key: string,
		sources: [string, T | undefined | null][],
	): T {
		for (const [sourceName, value] of sources) {
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

	// Loads config in this order (conditional): 1st Docker secret | 2nd environment | 3rd hardcoded values
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
	};

	logger.log("[config] Final config object:", config);

	cachedConfig = config; // Cache the config
	return config;
}

// =============================================================================
// OLD FUNCTION CODE THAT DIDN'T HAVE CONSOLE LOG PRINTS NOR CHECKED IF loadSecrets EXISTS
// Function to read and assign config values from Docker secrets, environment or hardcoded values
// export function getConfig(): AppConfig {
// 	console.log("[Config] Loading config keys...");

// 	if (cachedConfig) return cachedConfig;

// 	const secretsPath = "/run/secrets"; // Docker-style secrets path
// 	// Define hardcoded values here
// 	const hardcodedDefaults = {
// 		PAGINATION_ENABLED: "true",
// 		DEFAULT_PAGE_SIZE: "10",
// 	};

// 	// Helper function to load from Docker-style secrets
// 	const loadSecret = (key: string): string | undefined => {
// 		const filePath = path.join(secretsPath, key.toLowerCase());
// 		if (fs.existsSync(filePath)) {
// 			return fs.readFileSync(filePath, "utf-8").trim();
// 		}
// 		return undefined;
// 	};

// 	// Loads config in this order (conditional): 1st Docker secret | 2nd environment | 3rd hardcoded values
// 	const config: AppConfig = {
// 		PAGINATION_ENABLED:
// 			loadSecret("PAGINATION_ENABLED") ??
// 			process.env.PAGINATION_ENABLED ??
// 			hardcodedDefaults.PAGINATION_ENABLED,

// 		DEFAULT_PAGE_SIZE:
// 			loadSecret("DEFAULT_PAGE_SIZE") ??
// 			process.env.DEFAULT_PAGE_SIZE ??
// 			hardcodedDefaults.DEFAULT_PAGE_SIZE,
// 	};

// 	cachedConfig = config; // Cache the config
// 	console.log("[Config] Final config object:", config);
// 	return config;
// }
