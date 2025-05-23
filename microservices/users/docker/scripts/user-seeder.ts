#!/usr/bin/env ts-node

import inquirer from "inquirer";
import { faker } from "@faker-js/faker";
import { generateMockData } from "./modules/generator";
import { readDataFile, writeDataFile } from "./modules/io";
import { sendDataToApi } from "./modules/api";
import { SchemaDescriptor } from "./modules/model";

// === CONFIGURABLE CONSTANTS === //
const DEFAULT_BASENAME = "seeded"; // Default filename of generated data
const DEFAULT_OUTPUT_PATH = "./seed_data/"; // Default folder of generated data
const SAVE_FAILED = true; // Save data of failed API request
const DEFAULT_FAILED_BASENAME = "failed_requests"; // Default filename of failed data
const DEFAULT_FAILED_OUTPUT_PATH = "./seed_data/failed/"; // Default folder of failed data

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
	// Prompt for model/schema to use
	const { selectedModel } = await inquirer.prompt([
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

	// Load model/schema
	const preset = MODEL_PRESETS.find((m) => m.value === selectedModel)!;
	const schema = await preset.schemaLoader();

	// Prompt to use a seed (generate same data) or random (generate new data)
	const { seedInput } = await inquirer.prompt([
		{
			type: "input",
			name: "seedInput",
			message: "Enter seed for data generation (leave blank for random):",
		},
	]);

	const seed = seedInput
		? parseInt(seedInput, 10)
		: Math.floor(Math.random() * 1_000_000);
	if (!seedInput) {
		console.log(` 🌱 No seed provided, using random seed: ${seed}`);
	}

	// Seed faker
	faker.seed(seed);

	// Prompt for generate data or extract it from a file
	const { mode } = await inquirer.prompt([
		{
			type: "list",
			name: "mode",
			message: "Do you want to generate data or read from a file?",
			choices: ["generate", "from file"],
		},
	]);

	let data: Record<string, any>[] = [];

	// If generate data
	if (mode === "generate") {
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
		const { filePath } = await inquirer.prompt([
			{
				type: "input",
				name: "filePath",
				message: "Enter the path to the CSV or JSON file:",
				default: `${DEFAULT_OUTPUT_PATH}${preset.filePrefix}_${DEFAULT_BASENAME}.csv`,
			},
		]);

		data = await readDataFile(filePath, schema);
	}

	// Send to API
	console.log(`\n🌍 Sending data to: ${preset.url}`);
	const resultSummary = await sendDataToApi(data, preset.url, 500);

	// Prompt to save rejected API requests
	if (SAVE_FAILED && resultSummary.failureCount > 0) {
		const { save: saveFailed } = await inquirer.prompt([
			{
				type: "confirm",
				name: "save",
				message: "Do you want to save failed records to a file?",
				default: true,
			},
		]);

		if (saveFailed) {
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
			const { mkdir } = await import("fs/promises");
			await mkdir(failedPath, { recursive: true });

			await writeDataFile(
				resultSummary.failedRecords,
				failedFullPath,
				schema,
				seed,
			);
			console.log(`📁 Failed records saved to: ${failedFullPath}`);
		}
	}

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
		console.log(`📁 Data saved to: ${fullPath}`);
	}
}

main().catch((err) => {
	console.error("❌ Script failed:", err.message);
	process.exit(1);
});
