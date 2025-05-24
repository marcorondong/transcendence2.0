import { readFile } from "fs/promises";
import { SchemaDescriptor } from "./model";
import { logPlain, logWarn } from "./logger";

// Helper function to extract valid field names from the schema
function getFieldNames(schema: SchemaDescriptor): string[] {
	return Object.keys(schema);
}

// Helper function to filter and normalize a single JSON entry
function filterEntryFields(
	entry: Record<string, any>,
	fields: string[],
	index: number,
	summary: { extra: number; missing: number },
): Record<string, any> {
	const filtered: Record<string, any> = {};
	const extraKeys = Object.keys(entry).filter((key) => !fields.includes(key));
	const missingKeys = fields.filter((key) => !(key in entry));

	if (extraKeys.length > 0) {
		logWarn(
			`⚠️ JSON entry [${index}] has extra field(s): ${extraKeys.join(
				", ",
			)}`,
		);
		summary.extra++;
	}
	if (missingKeys.length > 0) {
		logWarn(
			`⚠️ JSON entry [${index}] is missing field(s): ${missingKeys.join(
				", ",
			)}`,
		);
		summary.missing++;
	}

	fields.forEach((key) => {
		if (entry[key] !== undefined) {
			filtered[key] = entry[key];
		}
	});

	return filtered;
}

// Main function to parse JSON files
export async function parseJsonFile(
	filePath: string,
	schema: SchemaDescriptor, // schema descriptor to auto detect its fields
): Promise<Record<string, any>[]> {
	const raw = await readFile(filePath, "utf-8");
	const fields = getFieldNames(schema);
	const data: Record<string, any>[] = [];
	const summary = { extra: 0, missing: 0, invalid: 0 };

	// Match all JSON arrays (even across lines), non-greedy
	const blocks = raw.match(/\[\s*{[\s\S]*?}\s*\]/g) || [];

	blocks.forEach((block, blockIndex) => {
		try {
			const parsed = JSON.parse(block);
			if (Array.isArray(parsed)) {
				parsed.forEach((entry, i) => {
					const filtered = filterEntryFields(
						entry,
						fields,
						i,
						summary,
					);
					data.push(filtered); // We keep even invalid
				});
			}
		} catch (err: unknown) {
			logWarn(
				`⚠️ Skipping invalid JSON block ${blockIndex}: ${
					(err as Error).message
				}`,
			);
			summary.invalid++;
		}
	});

	logPlain(
		`📄 JSON parse summary: ${data.length} entries. ${summary.extra} extra fields, ${summary.missing} missing fields, ${summary.invalid} invalid blocks.`,
	);
	return data;
}

// Helper function to detect the CSV separator based on the header line (to support tabs, pipes, etc)
function detectSeparator(line: string, fields: string[]): string | null {
	const candidates = [",", "\t", ";", "|"];
	for (const sep of candidates) {
		const parts = line
			.split(sep)
			.map((p) => p.trim().replace(/^"+|"+$/g, ""));
		if (
			parts.length >= fields.length &&
			fields.every((field) => parts.includes(field))
		) {
			return sep;
		}
	}
	return null;
}

// Helper function to parse and unquote a single CSV value
function cleanCsvValue(value: string): string {
	let trimmed = value.trim();
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		trimmed = trimmed.slice(1, -1);
	}
	return trimmed.replace(/""/g, '"');
}

// Main function to parse CSV files
export async function parseCsvFile(
	filePath: string,
	schema: SchemaDescriptor, // schema descriptor to auto detect its fields
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
	const summary = { extra: 0, missing: 0, lines: 0 };

	for (let index = 0; index < lines.length; index++) {
		const line = lines[index];
		if (/^\s*(\/\/|#)/.test(line)) continue;

		// Attempt separator detection on the first data-like line
		if (!separator) {
			separator = detectSeparator(line, fields);
			if (separator) {
				headers = line.split(separator).map((h) => cleanCsvValue(h));
				continue;
			} else {
				logWarn(
					`⚠️ Line ${
						index + 1
					}: Unable to detect separator — expected a header with fields like [${fields.join(
						", ",
					)}] — skipping line.`,
				);
				continue;
			}
		}

		const maybeHeader = line.split(separator).map(cleanCsvValue);
		const isRepeatedHeader =
			maybeHeader.length === headers.length &&
			maybeHeader.every((v, i) => v === headers[i]);

		if (isRepeatedHeader) {
			logWarn(`🔁 Line ${index + 1}: Repeated header detected — skipped`);
			continue;
		}

		const values = maybeHeader;
		const record: Record<string, any> = {};

		fields.forEach((field) => {
			const i = headers.indexOf(field);
			if (i !== -1) {
				record[field] = values[i];
			}
		});

		const extraCols = values.length > headers.length;
		const missingCols = fields.some((field) => !(field in record));

		if (extraCols) {
			logWarn(`⚠️ Line ${index + 1}: Extra column(s) detected`);
			summary.extra++;
		}
		if (missingCols) {
			const missing = fields.filter((key) => !(key in record));
			logWarn(
				`⚠️ Line ${index + 1}: Missing field(s): ${missing.join(", ")}`,
			);
			summary.missing++;
		}

		records.push(record);
		summary.lines++;
	}

	logPlain(
		`📄 CSV parse summary: ${summary.lines} lines parsed. ${summary.extra} with extra columns, ${summary.missing} with missing fields.`,
	);
	return records;
}
