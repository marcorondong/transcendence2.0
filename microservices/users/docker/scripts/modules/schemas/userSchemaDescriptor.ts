import { SchemaDescriptor } from "../model";

// MR_NOTE: For checking how to correctly pass faker args;
// check the functions in `generator.ts` (in fallback by type section)

// Define the fields and their properties of the schema / model (Check the available properties in 'model.ts')
export const userSchemaDescriptor: SchemaDescriptor = {
	username: {
		type: "string",
		minLength: 3,
		fakerMethod: "internet.username",
		validator: (value: string) =>
			typeof value === "string" &&
			value.length >= 3 &&
			/\S/.test(value) && // no whitespace-only
			/\D/.test(value) && // not numbers-only
			/[a-zA-Z]/.test(value), // must contain at least one letter
	},

	nickname: {
		type: "string",
		minLength: 3,
		fakerMethod: "person.firstName",
		// fixed: () => `user_${Math.floor(Math.random() * 1000)}`, // TODO: Testing
		validator: (value: string) =>
			typeof value === "string" &&
			value.length >= 3 &&
			/\S/.test(value) &&
			/\D/.test(value) &&
			/[a-zA-Z]/.test(value),
	},

	email: {
		type: "email",
		fakerMethod: "internet.email",
		// args: [{ firstName: "testuser", provider: "example.com" }], // TODO: TESTING
		postProcess: (value: string) => value.toLowerCase(), // My USERS service doesn't allow uppercase emails
		validator: (value: string) =>
			/^[\x00-\x7F]+$/.test(value) && // ASCII only
			/^[^A-Z]+$/.test(value), // no uppercase
	},

	password: {
		type: "string",
		minLength: 6,
		// fakerMethod: "internet.password",
		fixed: "P@ssword123!", // TODO: TESTING
		notContains: ["username", "nickname", "email"],
		validator: (value: string) =>
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/.test(value),
	},
};

// FieldDescriptor values, meanings and usage examples
//
// | Property       | Purpose                                             | Example usage                                   | Effect on generation                 |
// | -------------- | --------------------------------------------------- | ----------------------------------------------- | ------------------------------------ |
// | `type`         | Declares data type (used for fallback faker)        | `"string"`, `"email"`, `"date"`                 | Affects fallback faker method        |
// | `required`     | Currently unused — for future validation            | `true`                                          | Can be used later in validation pass |
// | `minLength`    | Minimum string length                               | `minLength: 3`                                  | Used in fallback faker + validator   |
// | `maxLength`    | Maximum string length                               | `maxLength: 10`                                 | Can be used for validation           |
// | `pattern`      | Regex the value must match                          | `/^\w+$/`                                       | Enforced during validation           |
// | `notContains`  | Value must **not** contain any listed field values  | `["username", "email"]`                         | Prevents duplication or leaks        |
// | `matchesField` | Must match the value of another field               | `"passwordConfirmation"`                        | Not yet used, can be implemented     |
// | `enum`         | Allowed values (only for type `enum`)               | `["admin", "user"]`                             | Randomly picked if type is `enum`    |
// | `default`      | Fallback value if nothing is generated              | `"anonymous"`                                   | Used if all else fails               |
// | `fixed`        | Always use this value or run this function          | `"staticName"` or `() => "u" + random()`        | Skips faker, but still validated     |
// | `args`         | Passed to `fakerMethod`, usually as array or object | `[{ firstName: "user", provider: "mail.com" }]` | Customizes faker output              |
// | `fakerMethod`  | Which faker method to use                           | `"internet.email"`                              | Determines main data source          |
// | `postProcess`  | Modify value after generation                       | `value => value.toLowerCase()`                  | Runs before validation (after fix)   |
// | `validator`    | Custom validation function (returns true/false)     | `value => value.length >= 3`                    | Rejects value on `false`             |
// | `description`  | Textual info (for documentation or UI)              | `"User email address"`                          | Not used by script, for docs         |
// | `example`      | Example value (for docs, Swagger, etc.)             | `"user@example.com"`                            | Not used by script, for docs         |
//
// Examples:
//
// 1. Fixed Username
// username: {
// 	type: "string",
// 	fixed: "user123",
// }
// Always generates "user123".
//
// 2. Email With Custom Domain
// email: {
// 	type: "email",
// 	fakerMethod: "internet.email",
// 	args: [{ firstName: "testuser", provider: "dev.local" }],
// 	postProcess: (val) => val.toLowerCase(),
// }
// Generates things like: testuser54@dev.local
//
// 3. Enum Role
// role: {
// 	type: "enum",
// 	enum: ["admin", "user", "guest"]
// }
// Randomly picks one of the allowed strings.
//
// 4. Password With Validator
// password: {
// 	type: "string",
// 	minLength: 8,
// 	fixed: "P@ssword123!",
// 	validator: (val) => /[A-Z]/.test(val) && /[a-z]/.test(val) && /\d/.test(val),
// }
// Uses fixed value, but enforces that it's a valid password format.
