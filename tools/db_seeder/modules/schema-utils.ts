import { SchemaDescriptor } from "./model";

const validTypes = new Set([
	"string",
	"number",
	"boolean",
	"email",
	"uuid",
	"date",
	"enum",
	"custom",
]);

// This function is not being used yet
export function validateSchemaDescriptor(schema: SchemaDescriptor): string[] {
	const errors: string[] = [];

	for (const [key, desc] of Object.entries(schema)) {
		if (!validTypes.has(desc.type)) {
			errors.push(`Field "${key}" has invalid type: ${desc.type}`);
		}
		if (desc.enum && desc.type !== "enum") {
			errors.push(
				`Field "${key}" has enum values but type is not "enum"`,
			);
		}
		if (desc.pattern && !(desc.pattern instanceof RegExp)) {
			errors.push(`Field "${key}" has invalid RegExp pattern`);
		}

		if (desc.fixed !== undefined && desc.fakerMethod) {
			errors.push(
				`Field "${key}" has both "fixed" and "fakerMethod" defined — only one should be used.`,
			);
		}

		if (desc.args && !Array.isArray(desc.args)) {
			errors.push(
				`Field "${key}" has "args" defined but it is not an array.`,
			);
		}
	}

	return errors;
}
