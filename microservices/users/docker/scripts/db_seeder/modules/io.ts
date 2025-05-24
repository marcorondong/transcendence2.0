import { appendFile, access } from "fs/promises";
import { constants as fsConstants } from "fs";
import { extname } from "path";
import { parseJsonFile, parseCsvFile } from "./parser";
import { SchemaDescriptor } from "./model";

// === CONFIGURABLE CONSTANTS === //
const HEADER_TEMPLATE = (timestamp: string, seed?: number) =>
	`\n//========= ${timestamp} UTC${
		seed != null ? ` | seed: ${seed}` : ""
	} =========\n`;
const APPEND_JSON_SEPARATOR = true; // Appends the separator in json files for each run
const APPEND_CSV_SEPARATOR = true; // Appends the separator in csv files for each run
const APPEND_CSV_HEADER = true; // Adds "username,email,..."  for each run (if false, then adds it only when file is created)

export async function readDataFile(
	filePath: string,
	schema: SchemaDescriptor,
): Promise<Record<string, any>[]> {
	const ext = extname(filePath).toLowerCase();

	if (ext === ".json") {
		return parseJsonFile(filePath, schema);
	} else if (ext === ".csv") {
		return parseCsvFile(filePath, schema);
	} else {
		throw new Error(`Unsupported file extension: ${ext}`);
	}
}

export async function writeDataFile(
	data: Record<string, any>[],
	filePath: string,
	schema: SchemaDescriptor,
	seed?: number,
): Promise<void> {
	const ext = extname(filePath).toLowerCase();
	const fields = Object.keys(schema);

	const fileExists = await access(filePath, fsConstants.F_OK)
		.then(() => true)
		.catch(() => false);

	// For json files
	if (ext === ".json") {
		// Add separator if allowed
		const header = APPEND_JSON_SEPARATOR
			? HEADER_TEMPLATE(new Date().toISOString(), seed)
			: "";
		const json = JSON.stringify(data, null, 2);
		await appendFile(filePath, `${header}${json},\n`, "utf-8");

		// For csv files
	} else if (ext === ".csv") {
		const rows: string[] = [];
		// Add separator if allowed
		if (APPEND_CSV_SEPARATOR) {
			rows.push(
				`# ${HEADER_TEMPLATE(new Date().toISOString(), seed).trim()}`,
			);
		}
		// Add header if allowed or file is new
		if (APPEND_CSV_HEADER || (!APPEND_CSV_HEADER && !fileExists)) {
			rows.push(fields.join(","));
		}

		for (const row of data) {
			const values = fields.map((field) => {
				const val = row[field] ?? "";
				const str = String(val).replace(/"/g, '""');
				return `"${str}"`;
			});
			rows.push(values.join(","));
		}

		await appendFile(filePath, rows.join("\n") + "\n", "utf-8");
	} else {
		throw new Error(`Unsupported file extension: ${ext}`);
	}
}
