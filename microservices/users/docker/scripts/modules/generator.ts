import { faker } from "@faker-js/faker";
import { SchemaDescriptor, FieldDescriptor } from "./model";
import { logInfo, logWarn } from "./logger";

// To increase the chances of getting valid data
const MAX_RETRIES = 40;
// Logging flags
const LOG_OVERRIDE = true;
const LOG_SOURCE = true;
const LOG_FAILED_VALIDATION = true;
const LOG_UNUSED_OVERRIDES = true;

// For using fixed values or functions (Overriding via main script/logic the random value generation)
// It accepts strings, numbers, booleans or functions (`() =>`)
type GeneratorOptions = {
	overrides?: Record<string, string | number | boolean | (() => any)>;
	maxRetries?: number;
};

export function generateMockData(
	schema: SchemaDescriptor,
	count: number,
	options: GeneratorOptions = {},
): Record<string, any>[] {
	const { overrides = {}, maxRetries = MAX_RETRIES } = options;
	const result: Record<string, any>[] = [];
	const usedOverrideKeys = new Set<string>();

	for (let i = 0; i < count; i++) {
		if (LOG_OVERRIDE || LOG_SOURCE || LOG_FAILED_VALIDATION) {
			logInfo(`record [${i + 1}/${count}]`);
			console.log("{");
		}

		const record: Record<string, any> = {};

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

				if (LOG_OVERRIDE) {
					logInfo(`[override] ${field} = ${JSON.stringify(value)}`);
				}

				// Skip validation for overrides
				record[field] = value;
				if (LOG_SOURCE) {
					logInfo(`[source] ${field} ← ${source}`);
				}
				continue;
			}

			// 2. Use fixed value if provided
			if (desc.fixed !== undefined) {
				value =
					typeof desc.fixed === "function"
						? desc.fixed(record)
						: desc.fixed;
				source = "fixed";
			}

			// 3. Retry loop for faker + validation
			let retries = 0;
			while (retries < maxRetries) {
				if (value === undefined) {
					value = generateField(field, desc, record);
					source = "faker";
				}

				// 4. Post-process if defined
				if (desc.postProcess) {
					value = desc.postProcess(value, record);
				}

				const isValid = validateGeneratedField(
					field,
					value,
					desc,
					record,
				);
				if (isValid) break;

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
			if (LOG_SOURCE) {
				logInfo(`[source] ${field} ← ${source}`);
			}
		}

		if (LOG_OVERRIDE || LOG_SOURCE || LOG_FAILED_VALIDATION) {
			console.log("}");
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

function generateField(
	fieldName: string,
	desc: FieldDescriptor,
	currentRecord: Record<string, any>,
): any {
	// Use fakerMethod if defined
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

function validateGeneratedField(
	fieldName: string,
	value: any,
	desc: FieldDescriptor,
	currentRecord: Record<string, any>,
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

	// 3. Optional pattern fallback
	if (desc.pattern && !desc.pattern.test(value)) return false;

	return true;
}
