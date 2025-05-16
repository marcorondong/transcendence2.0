import fs from "fs";
import path from "path";

// Function Return type definition (for type safety)
type AppConfig = {
	PAGINATION_ENABLED: string;
	DEFAULT_PAGE_SIZE: string;
};

// For caching the result of reading files/envs.
// It’s initialized once when getConfig() is first called.
// It optimizes performance, ensures consistency, prevents unnecessary file reads or env parsing multiple times.
let cachedConfig: AppConfig | null = null;

// Function to read and assign config values from Docker secrets, environment or hardcoded values
export function getConfig(): AppConfig {
	if (cachedConfig) return cachedConfig;

	const secretsPath = "/run/secrets"; // Docker-style secrets path
	// Define hardcoded values here
	const hardcodedDefaults = {
		PAGINATION_ENABLED: "true",
		DEFAULT_PAGE_SIZE: "10",
	};

	// Helper function to load from Docker-style secrets
	const loadSecret = (key: string): string | undefined => {
		const filePath = path.join(secretsPath, key.toLowerCase());
		if (fs.existsSync(filePath)) {
			return fs.readFileSync(filePath, "utf-8").trim();
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
	};

	cachedConfig = config; // Cache the config
	return config;
}
