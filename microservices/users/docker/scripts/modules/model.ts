export type FieldType =
	| "string"
	| "number"
	| "boolean"
	| "email"
	| "uuid"
	| "date"
	| "enum"
	| "custom";

export interface FieldDescriptor {
	type: FieldType;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	pattern?: RegExp;
	notContains?: string[];
	matchesField?: string;
	enum?: string[];
	default?: any;
	fakerMethod?: string;
	postProcess?: (value: any, currentRecord?: Record<string, any>) => any;
	validator?: (value: any, currentRecord?: Record<string, any>) => boolean;
	description?: string;
	example?: string;
}

export type SchemaDescriptor = Record<string, FieldDescriptor>;

export async function getSchemaDescriptor(
	modelName: string,
): Promise<SchemaDescriptor> {
	switch (modelName) {
		case "user":
			return (await import("./schemas/userSchemaDescriptor"))
				.userSchemaDescriptor;
		// future: load Zod and convert
		// case "user":
		//   return extractDescriptorFromZod(userZodSchema);
		default:
			throw new Error(`Unknown schema model: ${modelName}`);
	}
}
