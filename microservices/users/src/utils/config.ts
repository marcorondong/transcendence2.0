import fs from "fs";
import path from "path";
import { logger } from "./logger";

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
export function getConfig(): AppConfig {
	if (cachedConfig) return cachedConfig;

	logger.log("[Config] Loading config...");

	const secretsPath = "/run/secrets"; // Docker-style secrets path
	const fixPackageJsonPath = "../../package.json";
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
			const pkgPath = path.resolve(__dirname, fixPackageJsonPath);
			return JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
		} catch (err) {
			logger.warn("[Config] Could not load package.json:", err);
			return {};
		}
	})();

	// Helper function to load from Docker-style secrets
	const loadSecret = (key: string | undefined): string | undefined => {
		logger.log("[Config] loadSecret() called for key:", key);
		if (!key || !hasSecretsFolder) return undefined;
		const filePath = path.join(secretsPath, key.toLowerCase());
		try {
			if (fs.existsSync(filePath)) {
				return fs.readFileSync(filePath, "utf-8").trim();
			}
		} catch (err) {
			// Optional:
			logger.warn(`[Config] Failed to read secret ${key}:`, err);
		}
		return undefined;
	};

	// Loads config in this order (conditional): 1st Docker secret | 2nd environment | 3rd hardcoded values
	const config: AppConfig = {
		PAGINATION_ENABLED:
			loadSecret("PAGINATION_ENABLED") ??
			process.env.PAGINATION_ENABLED ??
			hardcodedDefaults.PAGINATION_ENABLED,

		DEFAULT_PAGE_SIZE:
			loadSecret("DEFAULT_PAGE_SIZE") ??
			process.env.DEFAULT_PAGE_SIZE ??
			hardcodedDefaults.DEFAULT_PAGE_SIZE,

		APP_VERSION:
			loadSecret("APP_VERSION") ??
			process.env.APP_VERSION ??
			pkg.version ??
			hardcodedDefaults.APP_VERSION,

		APP_NAME:
			loadSecret("APP_NAME") ??
			process.env.APP_NAME ??
			pkg.name ??
			hardcodedDefaults.APP_NAME,

		APP_DESCRIPTION:
			loadSecret("APP_DESCRIPTION") ??
			process.env.APP_DESCRIPTION ??
			pkg.description ??
			hardcodedDefaults.APP_DESCRIPTION,

		NODE_ENV:
			loadSecret("NODE_ENV") ??
			process.env.NODE_ENV ??
			hardcodedDefaults.NODE_ENV,
	};

	logger.log("[Config] Final config object:", config);

	// TODO: Remove these test cases for logger
	// START of test cases
	logger.log({ config }, "[Config] Final config object:");
	logger.info("Testing info", config.APP_DESCRIPTION);
	logger.warn({ appDescription: config.APP_DESCRIPTION }, "Testing warn");
	logger.warn(config.APP_DESCRIPTION, "Testing warn");
	logger.error("Testing error");
	logger.debug("Testing debug");
	logger.trace("Testing trace");
	logger.fatal("Testing fatal");
	logger.log("Testing log");

	logger.info("Hello %s!", "Alice");
	logger.debug("User %s has %d points", "Bob", 150);
	logger.warn("JSON object: %j", { id: 1, name: "Test" });
	logger.error("Price: $%d, Discount: %d%%", 199, 20);
	logger.trace("Escaped percent: %% %s", "done");
	logger.fatal("Multiple types: %s %d %j", "X", 42, { a: true });

	const a: any = {};
	a.self = a;
	logger.info("Cyclic? %j", a);
	// END of test cases

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
