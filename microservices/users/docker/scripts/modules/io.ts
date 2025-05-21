import { writeFile, appendFile, readFile, access } from "fs/promises";
import { constants as fsConstants } from "fs";
import { extname } from "path";
import { parseJsonFile, parseCsvFile } from "./parser";
import { SchemaDescriptor } from "./model";

const HEADER_TEMPLATE = (timestamp: string) =>
	`\n//========= ${timestamp} UTC =========\n`;
const APPEND_JSON_SEPARATOR = true;
const APPEND_CSV_SEPARATOR = true;
const APPEND_CSV_HEADER = true; // only adds "username,email,..." if file is new

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
): Promise<void> {
	const ext = extname(filePath).toLowerCase();
	const fields = Object.keys(schema);

	const fileExists = await access(filePath, fsConstants.F_OK)
		.then(() => true)
		.catch(() => false);

	if (ext === ".json") {
		const header = APPEND_JSON_SEPARATOR
			? HEADER_TEMPLATE(new Date().toISOString())
			: "";
		const json = JSON.stringify(data, null, 2);
		await appendFile(filePath, `${header}${json},\n`, "utf-8");
	} else if (ext === ".csv") {
		const rows: string[] = [];

		// Add header if allowed and file is new
		if (APPEND_CSV_SEPARATOR) {
			rows.push(`# ${HEADER_TEMPLATE(new Date().toISOString()).trim()}`);
		}
		if (APPEND_CSV_HEADER && !fileExists) {
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
