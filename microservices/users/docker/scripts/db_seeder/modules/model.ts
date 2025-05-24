// For declaring which fields the data belongs to
export type FieldType =
	| "string"
	| "number"
	| "boolean"
	| "email"
	| "uuid"
	| "date"
	| "enum"
	| "custom";

// These values will be set in the schemas descriptors
export interface FieldDescriptor {
	type: FieldType; // Declares data type (used for fallback faker). Affects fallback faker method. E.g: "string", "email", "date"
	required?: boolean; // For future validation. Can be used later in validation pass. E.g: true
	minLength?: number; // Minimum string length. Used in validator + fallback faker. E.g: minLength: 3
	maxLength?: number; // Maximum string length. Used in validator + fallback faker. E.g: maxLength: 10
	pattern?: RegExp; // Regex the value must match. Used in validator. E.g: /^\w+$/
	notContains?: string[]; // Value must not contain any listed field values. Used in validator. E.g: ["username", "email"]
	matchesField?: string; // Must match the value of another field. Used in validator. E.g: "passwordConfirmation"
	enum?: string[]; // Allowed values (only for type enum). Randomly picked if type is enum in fallback faker. E.g: ["admin", "user"]
	default?: any; // Fallback value if nothing is generated. Used if all else fails in fallback faker. E.g: "anonymous"
	fixed?: any | (() => any); // Always use this value or run this function. Skips faker, but still validated. E.g: "staticName" or () => "u" + random()
	args?: any[]; // Optional args for fakerMethod. Passed to fakerMethod, usually as array or object. Customizes faker output. E.g: [{ firstName: "user", provider: "mail.com" }]
	fakerMethod?: string; // Which faker method to use. Determines main data source. E.g: "internet.email"
	postProcess?: (value: any, currentRecord?: Record<string, any>) => any; // Modify value after generation. Runs before validation (after fix). E.g: value => value.toLowerCase()
	validator?: (value: any, currentRecord?: Record<string, any>) => boolean; // Custom validation function (returns true/false). Rejects value on false. E.g: value => value.length >= 3
	description?: string; // Textual info (for documentation or UI). E.g: "User email address"
	example?: string; // Example value (for docs, Swagger, etc.). E.g: "user@example.com"
}

export type SchemaDescriptor = Record<string, FieldDescriptor>;

// Function for loading schema descriptors
export async function getSchemaDescriptor(
	modelName: string,
): Promise<SchemaDescriptor> {
	switch (modelName) {
		case "user":
			return (await import("./schemas/userSchemaDescriptor"))
				.userSchemaDescriptor;
		// Add more schemas descriptors here (Remember to add their presets in main script logic)
		// case "matches":
		// 	return (await import("./schemas/matchesSchemaDescriptor"))
		// 		.matchesSchemaDescriptor;
		// future: load Zod and convert
		// case "user":
		//   return extractDescriptorFromZod(userZodSchema);
		default:
			throw new Error(`Unknown schema model: ${modelName}`);
	}
}
