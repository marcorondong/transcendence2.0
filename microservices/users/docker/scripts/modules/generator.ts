import { faker } from "@faker-js/faker";
import { SchemaDescriptor, FieldDescriptor } from "./model";

const MAX_RETRIES = 40;

type GeneratorOptions = {
	overrides?: Record<string, () => any>;
	maxRetries?: number;
};

export function generateMockData(
	schema: SchemaDescriptor,
	count: number,
	options: GeneratorOptions = {},
): Record<string, any>[] {
	const { overrides = {}, maxRetries = MAX_RETRIES } = options;
	const result: Record<string, any>[] = [];

	for (let i = 0; i < count; i++) {
		const record: Record<string, any> = {};

		for (const [field, desc] of Object.entries(schema)) {
			let value: any;

			// Use override if provided
			if (overrides[field]) {
				value = overrides[field]!();
			}

			// Use fixed value if specified in schema
			if (value === undefined && desc.fixed !== undefined) {
				value =
					typeof desc.fixed === "function"
						? desc.fixed(record)
						: desc.fixed;
			}

			// Retry loop to generate valid value
			let retries = 0;
			while (retries < maxRetries) {
				if (value === undefined) {
					value = generateField(field, desc, record);
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

				value =
					overrides[field]?.() ?? generateField(field, desc, record);
				retries++;
			}

			record[field] = value;
		}

		result.push(record);
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
