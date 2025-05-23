#!/usr/bin/env ts-node

import inquirer from "inquirer";
import { mkdir } from "fs/promises";
import { faker } from "@faker-js/faker";
import { generateMockData } from "./modules/generator";
import { readDataFile, writeDataFile } from "./modules/io";
import { sendDataToApi } from "./modules/api";
import { SchemaDescriptor } from "./modules/model";
import { logPlain, logError, initLogger } from "./modules/logger";

// === CONFIGURABLE CONSTANTS === //
const DEFAULT_BASENAME = "seeded"; // Default filename of generated data
const DEFAULT_OUTPUT_PATH = "./seed_data/"; // Default folder of generated data
const SAVE_FAILED = true; // Save data of failed API request
const DEFAULT_FAILED_BASENAME = "failed_requests"; // Default filename of failed data
const DEFAULT_FAILED_OUTPUT_PATH = "./seed_data/failed/"; // Default folder of failed data

// === CLI FLAG PARSING === //
const args = Object.fromEntries(
	process.argv.slice(2).map((arg) => {
		const [key, val = true] = arg.replace(/^--/, "").split("=");
		return [key, val];
	}),
);

const isAuto = "auto" in args;
const filePath = typeof args.file === "string" ? args.file : null;
const modelArg = typeof args.model === "string" ? args.model : null;
const seedArg = typeof args.seed === "string" ? parseInt(args.seed, 10) : null;
const countArg = typeof args.count === "string" ? parseInt(args.count, 10) : 10;
const saveMode = args.save === "csv" || args.save === "json" ? args.save : null;
const silentMode = "silent" in args;
const summaryPath =
	typeof args.summary === "string" // -E.g: '--summary=custom/path.txt' --> Uses custom path
		? args.summary
		: args.summary === true
		? "./logs/summary.log" // E.g: '--summary' (no value)--> Uses default
		: null; // No summary is created

// === Validate mutually exclusive flags === //
if (isAuto && filePath) {
	logError("❌ Flags --auto and --file are mutually exclusive");
	process.exit(1);
}

// === Setup logging === //
initLogger({ silent: silentMode, summaryPath });

// === Select mode === //
const mode = isAuto ? "auto" : filePath ? "file" : "interactive";

// === Validate model for auto/file mode === //
if (mode !== "interactive" && !modelArg) {
	logError("❌ Missing required flag: --model=<model_name>");
	process.exit(1);
}

// === MODELS DEFAULTS (api route, schema, etc) === //
const MODEL_PRESETS = [
	{
		label: "Users",
		value: "user",
		schemaLoader: async (): Promise<SchemaDescriptor> =>
			(await import("./modules/schemas/userSchemaDescriptor"))
				.userSchemaDescriptor,
		url: "http://localhost:3000/api/users",
		filePrefix: "users",
	},
	// Add more model presets here
];

// === MAIN === //
async function main() {
	// TODO: START OLD CODE BLOCK
	// // Prompt for model/schema to use
	// const { selectedModel } = await inquirer.prompt([
	// 	{
	// 		type: "list",
	// 		name: "selectedModel",
	// 		message: "Which model do you want to work with?",
	// 		choices: MODEL_PRESETS.map((m) => ({
	// 			name: m.label,
	// 			value: m.value,
	// 		})),
	// 	},
	// ]);
	// TODO: END OLD CODE BLOCK
	// TODO: START New block
	// Prompt or validate model
	let selectedModel: string;
	if (mode === "interactive") {
		// Prompt for model/schema to use
		const res = await inquirer.prompt([
			{
				type: "list",
				name: "selectedModel",
				message: "Which model do you want to work with?",
				choices: MODEL_PRESETS.map((m) => ({
					name: m.label,
					value: m.value,
				})),
			},
		]);
		selectedModel = res.selectedModel;
	} else {
		selectedModel = modelArg!;
		if (!MODEL_PRESETS.some((m) => m.value === selectedModel)) {
			logError(`❌ Unknown model: ${selectedModel}`);
			process.exit(1);
		}
	}
	// TODO: END New block

	// Load model/schema
	const preset = MODEL_PRESETS.find((m) => m.value === selectedModel)!;
	const schema = await preset.schemaLoader();

	// TODO: START OLD BLOCK
	// Prompt to use a seed (generate same data) or random (generate new data)
	// const { seedInput } = await inquirer.prompt([
	// 	{
	// 		type: "input",
	// 		name: "seedInput",
	// 		message: "Enter seed for data generation (leave blank for random):",
	// 	},
	// ]);

	// const seed = seedInput
	// 	? parseInt(seedInput, 10)
	// 	: Math.floor(Math.random() * 1_000_000);
	// if (!seedInput) {
	// 	logPlain(` 🌱 No seed provided, using random seed: ${seed}`);
	// }
	// TODO: END OLD BLOCK
	// TODO: START NEW BLOCK
	let seed: number;
	if (mode === "interactive") {
		const { seedInput } = await inquirer.prompt([
			{
				type: "input",
				name: "seedInput",
				message:
					"Enter seed for data generation (leave blank for random):",
			},
		]);
		seed = seedInput
			? parseInt(seedInput, 10)
			: Math.floor(Math.random() * 1_000_000);
		if (!seedInput) {
			logPlain(` 🌱 No seed provided, using random seed: ${seed}`);
		}
	} else {
		seed = seedArg ?? Math.floor(Math.random() * 1_000_000);
	}
	// TODO: END NEW BLOCK
	// Seed faker
	faker.seed(seed);

	// TODO: START OLD CODE BLOCK
	// // Prompt for generate data or extract it from a file
	// const { mode } = await inquirer.prompt([
	// 	{
	// 		type: "list",
	// 		name: "mode",
	// 		message: "Do you want to generate data or read from a file?",
	// 		choices: ["generate", "from file"],
	// 	},
	// ]);

	// let data: Record<string, any>[] = [];

	// // If generate data
	// if (mode === "generate") {
	// 	const { count } = await inquirer.prompt([
	// 		{
	// 			type: "number",
	// 			name: "count",
	// 			message: "How many records do you want to generate?",
	// 			default: 10,
	// 			validate: (val) =>
	// 				val != null && Number.isInteger(val) && val > 0
	// 					? true
	// 					: "Enter a positive integer",
	// 		},
	// 	]);

	// 	// Generate data
	// 	data = generateMockData(schema, count, {
	// 		// Override a field (use this value/function instead of faker)
	// 		// overrides: { username: "fixedValue" }, // TODO: Testing
	// 	});
	// 	// If extract data from a file
	// } else {
	// 	const { filePath } = await inquirer.prompt([
	// 		{
	// 			type: "input",
	// 			name: "filePath",
	// 			message: "Enter the path to the CSV or JSON file:",
	// 			default: `${DEFAULT_OUTPUT_PATH}${preset.filePrefix}_${DEFAULT_BASENAME}.csv`,
	// 		},
	// 	]);

	// 	data = await readDataFile(filePath, schema);
	// }
	// TODO: END OLD CODE BLOCK
	// TODO: START NEW BLOCK
	let data: Record<string, any>[] = [];

	if (mode === "interactive") {
		// Prompt for generate data or extract it from a file
		const { mode: userMode } = await inquirer.prompt([
			{
				type: "list",
				name: "mode",
				message: "Do you want to generate data or read from a file?",
				choices: ["generate", "from file"],
			},
		]);

		// If generate data
		if (userMode === "generate") {
			const { count } = await inquirer.prompt([
				{
					type: "number",
					name: "count",
					message: "How many records do you want to generate?",
					default: 10,
					validate: (val) =>
						val != null && Number.isInteger(val) && val > 0
							? true
							: "Enter a positive integer",
				},
			]);

			// Generate data
			data = generateMockData(schema, count, {
				// Override a field (use this value/function instead of faker)
				// overrides: { username: "fixedValue" }, // TODO: Testing
			});
			// If extract data from a file
		} else {
			const { filePath: userFilePath } = await inquirer.prompt([
				{
					type: "input",
					name: "filePath",
					message: "Enter the path to the CSV or JSON file:",
					default: `${DEFAULT_OUTPUT_PATH}${preset.filePrefix}_${DEFAULT_BASENAME}.csv`,
				},
			]);
			data = await readDataFile(userFilePath, schema);
		}
		// If automatic mode + generate random data
	} else if (mode === "auto") {
		// Generate data
		data = generateMockData(schema, countArg, {
			// Override a field (use this value/function instead of faker)
			// overrides: { username: "fixedValue" }, // TODO: Testing
		});

		// If automatic mode + extract data from file
	} else if (mode === "file") {
		data = await readDataFile(filePath!, schema);
	}
	// TODO: END NEW BLOCK

	// Send to API
	logPlain(`\n🌍 Sending data to: ${preset.url}`);
	const resultSummary = await sendDataToApi(data, preset.url, 500);

	// TODO: START OLD BLOCK
	// // Prompt to save rejected API requests
	// if (SAVE_FAILED && resultSummary.failureCount > 0) {
	// 	const { save: saveFailed } = await inquirer.prompt([
	// 		{
	// 			type: "confirm",
	// 			name: "save",
	// 			message: "Do you want to save failed records to a file?",
	// 			default: true,
	// 		},
	// 	]);

	// 	if (saveFailed) {
	// 		const {
	// 			format: failedFormat,
	// 			fileName: failedName,
	// 			outputPath: failedPath,
	// 		} = await inquirer.prompt([
	// 			{
	// 				type: "list",
	// 				name: "format",
	// 				message: "Choose the output format for failed records:",
	// 				choices: ["csv", "json"],
	// 				default: "csv",
	// 			},
	// 			{
	// 				type: "input",
	// 				name: "fileName",
	// 				message: "Enter the output filename (without extension):",
	// 				default: DEFAULT_FAILED_BASENAME,
	// 			},
	// 			{
	// 				type: "input",
	// 				name: "outputPath",
	// 				message: "Enter the output folder path:",
	// 				default: DEFAULT_FAILED_OUTPUT_PATH,
	// 			},
	// 		]);

	// 		const failedFullPath = `${failedPath.replace(
	// 			/\/$/,
	// 			"",
	// 		)}/${failedName}.${failedFormat}`;

	// 		// Ensure folder exists
	// 		const { mkdir } = await import("fs/promises"); // TODO: Do I need to import here?
	// 		await mkdir(failedPath, { recursive: true });

	// 		await writeDataFile(
	// 			resultSummary.failedRecords,
	// 			failedFullPath,
	// 			schema,
	// 			seed,
	// 		);
	// 		logPlain(`📁 Failed records saved to: ${failedFullPath}`);
	// 	}
	// }
	// TODO: END OLD BLOCK
	// TODO: START NEW BLOCK
	// Prompt to save rejected API requests
	if (SAVE_FAILED && resultSummary.failureCount > 0) {
		if (mode === "interactive") {
			const { save: saveFailed } = await inquirer.prompt([
				{
					type: "confirm",
					name: "save",
					message: "Do you want to save failed records to a file?",
					default: true,
				},
			]);

			if (!saveFailed) return;
			const {
				format: failedFormat,
				fileName: failedName,
				outputPath: failedPath,
			} = await inquirer.prompt([
				{
					type: "list",
					name: "format",
					message: "Choose the output format for failed records:",
					choices: ["csv", "json"],
					default: "csv",
				},
				{
					type: "input",
					name: "fileName",
					message: "Enter the output filename (without extension):",
					default: DEFAULT_FAILED_BASENAME,
				},
				{
					type: "input",
					name: "outputPath",
					message: "Enter the output folder path:",
					default: DEFAULT_FAILED_OUTPUT_PATH,
				},
			]);

			const failedFullPath = `${failedPath.replace(
				/\/$/,
				"",
			)}/${failedName}.${failedFormat}`;
			// Ensure folder exists
			// const { mkdir } = await import("fs/promises");
			await mkdir(failedPath, { recursive: true });
			await writeDataFile(
				resultSummary.failedRecords,
				failedFullPath,
				schema,
				seed,
			);
			logPlain(`📁 Failed records saved to: ${failedFullPath}`);
		} else if (saveMode) {
			const failedPath = `${DEFAULT_FAILED_OUTPUT_PATH}${DEFAULT_FAILED_BASENAME}.${saveMode}`;
			// const { mkdir } = await import("fs/promises");
			await mkdir(DEFAULT_FAILED_OUTPUT_PATH, { recursive: true });
			await writeDataFile(
				resultSummary.failedRecords,
				failedPath,
				schema,
				seed,
			);
			logPlain(`📁 Failed records saved to: ${failedPath}`);
		}
	}
	// TODO: END NEW BLOCK

	// TODO: START OLD BLOCK
	// // Prompt to save generated data
	// const { save } = await inquirer.prompt([
	// 	{
	// 		type: "confirm",
	// 		name: "save",
	// 		message: "Do you want to save this data to a file?",
	// 		default: true,
	// 	},
	// ]);

	// if (save) {
	// 	const { format, fileName, outputPath } = await inquirer.prompt([
	// 		{
	// 			type: "list",
	// 			name: "format",
	// 			message: "Choose the output format:",
	// 			choices: ["csv", "json"],
	// 			default: "csv",
	// 		},
	// 		{
	// 			type: "input",
	// 			name: "fileName",
	// 			message: "Enter the output filename (without extension):",
	// 			default: `${preset.filePrefix}_${DEFAULT_BASENAME}`,
	// 		},
	// 		{
	// 			type: "input",
	// 			name: "outputPath",
	// 			message: "Enter the output folder path:",
	// 			default: DEFAULT_OUTPUT_PATH,
	// 		},
	// 	]);

	// 	const fullPath = `${outputPath.replace(
	// 		/\/$/,
	// 		"",
	// 	)}/${fileName}.${format}`;
	// 	await writeDataFile(data, fullPath, schema, seed);
	// 	logPlain(`📁 Data saved to: ${fullPath}`);
	// }
	// TODO: END OLD BLOCK
	// TODO: START NEW BLOCK
	if (mode === "interactive") {
		// Prompt to save generated data
		const { save } = await inquirer.prompt([
			{
				type: "confirm",
				name: "save",
				message: "Do you want to save this data to a file?",
				default: true,
			},
		]);

		if (save) {
			const { format, fileName, outputPath } = await inquirer.prompt([
				{
					type: "list",
					name: "format",
					message: "Choose the output format:",
					choices: ["csv", "json"],
					default: "csv",
				},
				{
					type: "input",
					name: "fileName",
					message: "Enter the output filename (without extension):",
					default: `${preset.filePrefix}_${DEFAULT_BASENAME}`,
				},
				{
					type: "input",
					name: "outputPath",
					message: "Enter the output folder path:",
					default: DEFAULT_OUTPUT_PATH,
				},
			]);

			const fullPath = `${outputPath.replace(
				/\/$/,
				"",
			)}/${fileName}.${format}`;
			await writeDataFile(data, fullPath, schema, seed);
			logPlain(`📁 Data saved to: ${fullPath}`);
		}
	} else if (saveMode) {
		const fullPath = `${DEFAULT_OUTPUT_PATH}${preset.filePrefix}_${DEFAULT_BASENAME}.${saveMode}`;
		// const { mkdir } = await import("fs/promises");
		await mkdir(DEFAULT_OUTPUT_PATH, { recursive: true });
		await writeDataFile(data, fullPath, schema, seed);
		logPlain(`📁 Data saved to: ${fullPath}`);
	}
	// TODO: END NEW BLOCK
}

main().catch((err) => {
	logError(`❌ Script failed: ${err.message}`);
	process.exit(1);
});
