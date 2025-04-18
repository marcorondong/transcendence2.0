import { z, ZodTypeAny, ZodObject } from "zod";

// MR_NOTE: In Zod, everything is required by default.

// Helper function to convert empty strings to undefined (Protection against invalid queries)
export const blankToUndefined = <T extends ZodTypeAny>(schema: T) =>
	z.preprocess(
		(val) =>
			typeof val === "string" && val.trim() === "" ? undefined : val,
		schema.optional(),
	);

// Helper function to recursively wrap all fields in an object schema with blankToUndefined()
export const sanitizeQuerySchema = <T extends ZodObject<any>>(schema: T): T => {
	const shape = schema.shape;

	const newShape = Object.fromEntries(
		Object.entries(shape).map(([key, value]) => [
			key,
			blankToUndefined(value as ZodTypeAny),
		]),
	);
	return z.object(newShape) as T;
};

// Name field schema
export const nameField = z
	.string({
		required_error: "Name is required",
		invalid_type_error: "Name must be a string",
	})
	.min(3, "Name must be at least 3 characters long")
	.refine((val) => val.trim().length > 0, {
		message: "Name must not be empty or whitespace only",
	})
	.refine((val) => !/^\d+$/.test(val), {
		message: "Name must not be numbers only",
	})
	.refine((val) => /[a-zA-Z]/.test(val), {
		message: "Name must contain at least one letter",
	});

// Email field schema
export const emailField = z
	.string({
		required_error: "Email is required",
		invalid_type_error: "Email must be a string",
	})
	.email()
	.refine((val) => val === val.toLowerCase(), {
		message: "Invalid email format",
	});

// Password field schema
export const passwordField = z
	.string({
		required_error: "Password is required",
		invalid_type_error: "Password must be a string",
	})
	.min(6, "Password must be at least 6 characters long")
	.refine(
		(val) =>
			/[a-z]/.test(val) && // lowercase
			/[A-Z]/.test(val) && // uppercase
			/\d/.test(val) && // digit
			/[^a-zA-Z0-9]/.test(val), // symbol
		{
			message:
				"Password must include at least one uppercase, one lowercase, one number, and one symbol",
		},
	);

// Core user schema
const userCore = {
	email: emailField,
	name: nameField,
};

// Schema for createUser
export const createUserSchema = z
	.object({
		...userCore,
		password: passwordField,
	})
	.strict(); // Rejects unknown fields
// .superRefine((data, ctx) => {
// 	const password = data.password; // TODO: Maybe change it toLowerCase too
// 	const name = data.name.toLowerCase();
// 	const email = data.email.toLowerCase();
// 	if (password.toLowerCase().includes(name)) {
// 		ctx.addIssue({
// 			path: ["password"],
// 			code: z.ZodIssueCode.custom,
// 			message: "Password cannot contain the username",
// 			fatal: true, // Abort further checks
// 		});
// 		return z.NEVER; // Abort further checks
// 	}
// 	if (password.toLowerCase() === email) {
// 		ctx.addIssue({
// 			path: ["password"],
// 			code: z.ZodIssueCode.custom,
// 			message: "Password cannot be same as the email",
// 			fatal: true, // Abort further checks
// 		});
// 		return z.NEVER; // Abort further checks
// 	}
// });

// Schema for single user
export const userResponseSchema = z.object({
	id: z.number(),
	...userCore,
});

// OLD schema to get a user by ID
// export const userIdParamSchema = z
// 	.object({
// 		// id: z.number(),
// 		id: z.coerce.number(),
// 	})
// 	.strict();

// Schema to get a user by ID
export const userIdParamSchema = z
	.object({
		id: blankToUndefined(z.coerce.number().min(1)),
	})
	.strict(); //TODO: See if I have to use strict here too. Rejects unknown fields

// Schema to update all user fields
export const putUserSchema = createUserSchema;
// export const putUserSchema = z
// 	.object({
// 		...userCore,
// 		password: passwordField,
// 	})
// 	.strict(); // Rejects unknown fields

// Schema to update some user fields
export const patchUserSchema = putUserSchema.partial().strict(); // Rejects unknown fields

// Schema for login
export const loginSchema = z
	.object({
		email: z
			.string({
				required_error: "Email is required",
				invalid_type_error: "Email must be a string",
			})
			.email(),
		password: z.string(),
	})
	.strict(); // Rejects unknown fields

// Schema for login response
export const loginResponseSchema = z.object({
	accessToken: z.string(),
});

// Schema for array of users (for list responses)
export const userArrayResponseSchema = z.array(userResponseSchema);

// OLD Schema for query parameters to find users
// export const getUsersQuerySchema = z
// 	.object({
// 		id: z.coerce.number().optional(),
// 		email: z.string().email().optional(),
// 		// email: blankToUndefined(z.string().email()),
// 		name: z.string().optional(),
// 		// name: blankToUndefined(z.string()),
// 		useFuzzy: z.coerce.boolean().optional(),
// 		useOr: z.coerce.boolean().optional(),
// 		skip: z.coerce.number().min(0).optional(),
// 		take: z.coerce.number().min(1).max(100).optional(),
// 		sortBy: z.enum(["id", "email", "name"]).optional(),
// 		order: z.enum(["asc", "desc"]).optional(),
// 	})
// 	.strict(); // Rejects unknown fields

// TODO: Try to "automate" SortBy according to UserField/UniqueUserField
// Schema for query parameters to find users
const baseGetUsersQuerySchema = z.object({
	id: z.coerce.number().min(1),
	email: z.string().email(),
	name: z.string(),
	useFuzzy: z.coerce.boolean(),
	useOr: z.coerce.boolean(),
	skip: z.coerce.number().min(0),
	take: z.coerce.number().min(1).max(100),
	sortBy: z.enum(["id", "email", "name"]),
	order: z.enum(["asc", "desc"]),
});

// Refined schema for query parameters to find users
export const getUsersQuerySchema = sanitizeQuerySchema(
	baseGetUsersQuerySchema,
).strict(); // Rejects unknown fields

// TypeScript types inferred from schemas
export type createUserInput = z.infer<typeof createUserSchema>;
export type loginInput = z.infer<typeof loginSchema>;
export type updateUserPutInput = z.infer<typeof putUserSchema>; // TODO: Should I export this? (putUserInput)
export type updateUserPatchInput = z.infer<typeof patchUserSchema>; // TODO: Should I export this? (patchUserInput)
export type UpdateUserData = updateUserPutInput | updateUserPatchInput;
export type getUsersQuery = z.infer<typeof getUsersQuerySchema>;
// export type UserResponse = z.infer<typeof userResponseSchema>; // TODO: This is not used yet (I don't have an endpoint to retrieve single user)
// export type UserArrayResponse = z.infer<typeof userArrayResponseSchema>;
