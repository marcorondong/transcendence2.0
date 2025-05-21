import { SchemaDescriptor } from "../model";

export const userSchemaDescriptor: SchemaDescriptor = {
	username: {
		type: "string",
		minLength: 3,
		fakerMethod: "internet.userName",
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
		postProcess: (value: string) => value.toLowerCase(),
		validator: (value: string) =>
			/^[\x00-\x7F]+$/.test(value) && // ASCII only
			/^[^A-Z]+$/.test(value), // no uppercase
	},

	password: {
		type: "string",
		minLength: 6,
		fakerMethod: "internet.password",
		notContains: ["username", "nickname", "email"],
		validator: (value: string) =>
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/.test(value),
	},
};
