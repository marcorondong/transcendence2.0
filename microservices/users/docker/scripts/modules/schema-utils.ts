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
	}

	return errors;
}
