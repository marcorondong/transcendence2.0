import { readFile } from "fs/promises";
import { SchemaDescriptor } from "./model";

// Extracts valid field names from the schema
function getFieldNames(schema: SchemaDescriptor): string[] {
	return Object.keys(schema);
}

// Filters and normalizes a single JSON entry
function filterEntryFields(
	entry: Record<string, any>,
	fields: string[],
	index: number,
): Record<string, any> | null {
	const filtered: Record<string, any> = {};
	const extraKeys = Object.keys(entry).filter((key) => !fields.includes(key));
	const missingKeys = fields.filter((key) => !(key in entry));

	if (extraKeys.length > 0) {
		console.warn(
			`⚠️ JSON entry [${index}] has extra field(s): ${extraKeys.join(
				", ",
			)}`,
		);
	}
	if (missingKeys.length > 0) {
		console.warn(
			`⚠️ JSON entry [${index}] is missing field(s): ${missingKeys.join(
				", ",
			)}`,
		);
	}

	fields.forEach((key) => {
		if (entry[key] !== undefined) {
			filtered[key] = entry[key];
		}
	});

	return filtered;
}

export async function parseJsonFile(
	filePath: string,
	schema: SchemaDescriptor,
): Promise<Record<string, any>[]> {
	const raw = await readFile(filePath, "utf-8");
	const fields = getFieldNames(schema);

	const blocks = raw.split("\n").reduce<string[]>(
		(acc, line) => {
			if (line.trim().startsWith("//")) {
				acc.push("");
			} else {
				acc[acc.length - 1] += line + "\n";
			}
			return acc;
		},
		[""],
	);

	const data: Record<string, any>[] = [];

	for (const block of blocks) {
		const trimmed = block.trim();
		if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
			try {
				const parsed = JSON.parse(trimmed);
				if (Array.isArray(parsed)) {
					parsed.forEach((entry, i) => {
						const filtered = filterEntryFields(entry, fields, i);
						if (filtered) data.push(filtered);
					});
				}
			} catch (err: unknown) {
				console.warn(
					"⚠️ Skipping invalid JSON block:",
					(err as Error).message,
				);
			}
		}
	}

	return data;
}

// Tries to detect the CSV separator based on the header line
function detectSeparator(line: string, fields: string[]): string | null {
	const candidates = [",", "\t", ";", "|"];
	for (const sep of candidates) {
		const parts = line.split(sep);
		if (
			parts.length >= fields.length &&
			fields.every((field) => parts.includes(field))
		) {
			return sep;
		}
	}
	return null;
}

export async function parseCsvFile(
	filePath: string,
	schema: SchemaDescriptor,
): Promise<Record<string, any>[]> {
	const raw = await readFile(filePath, "utf-8");
	const lines = raw
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean);

	const fields = getFieldNames(schema);
	let headers: string[] = [];
	let separator: string | null = null;
	const records: Record<string, any>[] = [];

	for (let index = 0; index < lines.length; index++) {
		const line = lines[index];
		if (line.startsWith("//")) continue;

		if (!separator) {
			separator = detectSeparator(line, fields);
			if (separator) {
				headers = line.split(separator);
				continue;
			} else {
				console.warn(
					`⚠️ Line ${
						index + 1
					}: Unable to detect separator — skipping`,
				);
				continue;
			}
		}

		const values = line.split(separator);
		const record: Record<string, any> = {};

		fields.forEach((field) => {
			const i = headers.indexOf(field);
			if (i !== -1) record[field] = values[i];
		});

		const extraCols = values.length > headers.length;
		const missingCols = fields.some((field) => !(field in record));

		if (extraCols) {
			console.warn(`⚠️ Line ${index + 1}: Extra column(s) detected`);
		}
		if (missingCols) {
			const missing = fields.filter((key) => !(key in record));
			console.warn(
				`⚠️ Line ${index + 1}: Missing field(s): ${missing.join(", ")}`,
			);
		}

		records.push(record);
	}

	return records;
}
