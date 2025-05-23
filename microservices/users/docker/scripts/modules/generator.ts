import { faker } from "@faker-js/faker";
import { SchemaDescriptor, FieldDescriptor } from "./model";
import { logInfo, logPlain, logWarn } from "./logger";

// === CONFIGURABLE CONSTANTS === //
const MAX_RETRIES = 40; // To increase the chances of getting valid data
// Logging flags
const LOG_OVERRIDE = true; // Logs if overrides were used
const LOG_SOURCE = true; // Logs data source (override, fixed, faker)
const LOG_FAILED_VALIDATION = true; // Logs data that failed validation
const LOG_UNUSED_OVERRIDES = true; // Logs unused overrides

// For using fixed values or functions (Overriding via main script/logic the random value generation)
// It accepts strings, numbers, booleans or functions (`() =>`)
type GeneratorOptions = {
	overrides?: Record<string, string | number | boolean | (() => any)>;
	maxRetries?: number;
};

// Main function to generate data
export function generateMockData(
	schema: SchemaDescriptor, // Schema to use
	count: number, // number of records to generate
	options: GeneratorOptions = {},
): Record<string, any>[] {
	const { overrides = {}, maxRetries = MAX_RETRIES } = options; // GeneratorOptions
	const result: Record<string, any>[] = [];
	const usedOverrideKeys = new Set<string>(); // For counting unused overrides

	for (let i = 0; i < count; i++) {
		if (LOG_OVERRIDE || LOG_SOURCE || LOG_FAILED_VALIDATION) {
			logInfo(`record [${i + 1}/${count}]`);
			logPlain("{");
		}

		const record: Record<string, any> = {}; // Whole "data object" (fields : values) E.g: user

		for (const [field, desc] of Object.entries(schema)) {
			let value: any;
			let source: "override" | "fixed" | "faker" = "faker";

			// 1. Use override if provided (function or static value)
			if (overrides[field]) {
				const overrideFn =
					typeof overrides[field] === "function"
						? overrides[field]
						: () => overrides[field];
				value = overrideFn();
				source = "override";
				usedOverrideKeys.add(field);

				// Log overrides if any
				if (LOG_OVERRIDE) {
					logInfo(`[override] ${field} = ${JSON.stringify(value)}`);
				}

				// Skip validation for overrides
				record[field] = value;
				// Log data source
				if (LOG_SOURCE) {
					logInfo(`[source] ${field} ← ${source}`);
				}
				continue;
			}

			// 2. Use fixed value if provided (and no override was provided)
			if (desc.fixed !== undefined) {
				value =
					typeof desc.fixed === "function"
						? desc.fixed(record)
						: desc.fixed;
				source = "fixed";
			}

			// 3. Retry loop for faker + validation (for fixed and faker generated data)
			let retries = 0;
			while (retries < maxRetries) {
				if (value === undefined) {
					value = generateField(field, desc, record);
					source = "faker";
				}

				// 4. Post-process if defined (to clean/adapt data. E.g: lowercase emails)
				if (desc.postProcess) {
					value = desc.postProcess(value, record);
				}

				// Check if data is valid (uses schema descriptor validator, schemas constrains or default validation)
				const isValid = validateGeneratedField(
					field,
					value,
					desc,
					record,
				);
				if (isValid) break;

				// Log data that failed validation if any
				if (LOG_FAILED_VALIDATION) {
					logWarn(
						`[invalid] ${field} failed validation: ${JSON.stringify(
							value,
						)}`,
					);
				}

				value = generateField(field, desc, record);
				retries++;
			}

			record[field] = value;
			// Log data source
			if (LOG_SOURCE) {
				logInfo(`[source] ${field} ← ${source}`);
			}
		}

		if (LOG_OVERRIDE || LOG_SOURCE || LOG_FAILED_VALIDATION) {
			logPlain("}");
		}

		result.push(record);
	}

	// 5. Log unused override keys
	if (LOG_UNUSED_OVERRIDES) {
		for (const key of Object.keys(overrides)) {
			if (!usedOverrideKeys.has(key)) {
				logWarn(
					`[unused override] '${key}' does not match any schema field`,
				);
			}
		}
	}

	return result;
}

// Helper function to generate data per field
function generateField(
	fieldName: string,
	desc: FieldDescriptor, // Field of schema descriptor
	currentRecord: Record<string, any>,
): any {
	// Use fakerMethod if defined in schema descriptor (fakerMethod)
	if (desc.fakerMethod) {
		const fakerFn = desc.fakerMethod
			.split(".")
			.reduce(
				(obj: any, key: string) =>
					obj && typeof obj === "object" ? obj[key] : undefined,
				faker,
			);
		if (typeof fakerFn === "function") {
			// Use faker arguments if provided (via args in schema descriptor)
			if (desc.args && Array.isArray(desc.args)) {
				return fakerFn(...desc.args);
			}
			return fakerFn();
		}
	}

	// Fallback by type
	switch (desc.type) {
		case "string":
			return faker.string.alpha({ length: desc.minLength ?? 5 });
		case "number":
			return faker.number.int();
		case "boolean":
			return faker.datatype.boolean();
		case "email":
			return faker.internet.email().toLowerCase();
		case "uuid":
			return faker.string.uuid();
		case "date":
			return faker.date.past().toISOString();
		case "enum":
			return faker.helpers.arrayElement(desc.enum ?? []);
	}

	return desc.default ?? null;
}

// Helper function to validate generated data
function validateGeneratedField(
	fieldName: string,
	value: any, // value to be validated
	desc: FieldDescriptor, // Field of schema descriptor
	currentRecord: Record<string, any>, // Whole "data object" (fields : values) E.g: user
): boolean {
	// 1. Custom validator takes priority
	if (desc.validator && !desc.validator(value, currentRecord)) return false;

	// 2. notContains check
	if (
		desc.notContains?.some((key) =>
			String(value).includes(String(currentRecord[key] ?? "")),
		)
	) {
		return false;
	}

	// 3. pattern check (e.g., regex for format)
	if (desc.pattern && !desc.pattern.test(value)) return false;

	// 4. minLength check for strings
	if (
		typeof value === "string" &&
		typeof desc.minLength === "number" &&
		value.length < desc.minLength
	) {
		return false;
	}

	// 5. maxLength check for strings
	if (
		typeof value === "string" &&
		typeof desc.maxLength === "number" &&
		value.length > desc.maxLength
	) {
		return false;
	}

	// 6. matchesField check (must equal another field's value)
	if (desc.matchesField && value !== currentRecord[desc.matchesField]) {
		return false;
	}

	// 7. enum check (only for enum type)
	if (desc.type === "enum" && desc.enum && !desc.enum.includes(value)) {
		return false;
	}

	// 8. basic type check
	switch (desc.type) {
		case "string":
			if (typeof value !== "string") return false;
			break;
		case "number":
			if (typeof value !== "number") return false;
			break;
		case "boolean":
			if (typeof value !== "boolean") return false;
			break;
		case "email":
		case "uuid":
		case "date":
			if (typeof value !== "string") return false;
			break;
		case "enum":
			if (typeof value !== "string") return false;
			break;
	}

	return true;
}
