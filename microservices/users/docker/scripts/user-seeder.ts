#!/usr/bin/env ts-node

import inquirer from "inquirer";
import { faker } from "@faker-js/faker";
import { generateMockData } from "./modules/generator";
import { readDataFile, writeDataFile } from "./modules/io";
import { sendDataToApi } from "./modules/api";
import { SchemaDescriptor } from "./modules/model";

// === CONFIGURABLE CONSTANTS ===
const DEFAULT_BASENAME = "seeded";
const DEFAULT_OUTPUT_PATH = "./seed_data/";

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

// === MAIN ===
async function main() {
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

	const preset = MODEL_PRESETS.find((m) => m.value === selectedModel)!;
	const schema = await preset.schemaLoader();

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

	faker.seed(seed);

	const { mode } = await inquirer.prompt([
		{
			type: "list",
			name: "mode",
			message: "Do you want to generate data or read from a file?",
			choices: ["generate", "from file"],
		},
	]);

	let data: Record<string, any>[] = [];

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

		data = generateMockData(schema, count);
	} else {
		const { filePath } = await inquirer.prompt([
			{
				type: "input",
				name: "filePath",
				message: "Enter the path to the JSON or CSV file:",
				default: `${DEFAULT_OUTPUT_PATH}${preset.filePrefix}_${DEFAULT_BASENAME}.json`,
			},
		]);

		data = await readDataFile(filePath, schema);
	}

	// Send to API
	console.log(`\n🌍 Sending data to: ${preset.url}`);
	await sendDataToApi(data, preset.url, 500);

	// Ask to save data
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
				choices: ["json", "csv"],
				default: "json",
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
