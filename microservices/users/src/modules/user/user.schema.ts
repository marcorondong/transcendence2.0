import { z, ZodTypeAny, ZodObject } from "zod";

const sortDirections = ["asc", "desc"] as const;
const sortDirectionEnum = z.enum(sortDirections);
export type SortDirection = (typeof sortDirections)[number];

const userPublicFields = ["id", "email", "name"] as const;
const userSortByEnum = z.enum(userPublicFields);
export type UserPublicField = (typeof userPublicFields)[number];

export type UniqueUserField =
	| { id: number }
	| { email: string }
	| { name: string };

export type UserField = Partial<Record<UserPublicField, string | number>>;

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
		Object.entries(shape).map(([key, value]) => {
			// Handle nested object
			if (value instanceof z.ZodObject) {
				return [key, sanitizeQuerySchema(value)];
			}
			// Handle array of objects
			if (value instanceof z.ZodArray) {
				const inner = value._def.type;
				if (inner instanceof z.ZodObject) {
					const sanitizedInner = sanitizeQuerySchema(inner);
					return [key, z.array(sanitizedInner)];
				}
				// If not object, fallback to blankToUndefined on array itself
				return [key, blankToUndefined(value as ZodTypeAny)];
			}
			// Default: sanitize top-level field
			return [key, blankToUndefined(value as ZodTypeAny)];
		}),
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
	.strict();

// Schema for single user
export const userResponseSchema = z.object({
	id: z.number(),
	...userCore,
});

// Schema to get a user by ID
export const userIdParamSchema = z
	.object({
		id: blankToUndefined(z.coerce.number().min(1)),
	})
	.strict(); // Rejects unknown fields

// Schema to update ALL user fields
export const putUserSchema = createUserSchema;

// Schema to update SOME user fields
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

// TODO: Try to "automate" SortBy according to UserField/UniqueUserField
// Base schema for query parameters
const baseGetUsersQuerySchema = z.object({
	id: z.coerce.number().min(1),
	email: z.string().email(),
	name: z.string(),
	useFuzzy: z.coerce.boolean(),
	useOr: z.coerce.boolean(),
	skip: z.coerce.number().min(0),
	take: z.coerce.number().min(1).max(100),
	// sortBy: z.enum(["id", "email", "name"]),
	sortBy: userSortByEnum,
	// order: z.enum(["asc", "desc"]),
	order: sortDirectionEnum,
});

// Refined schema for query parameters to find users
export const getUsersQuerySchema = sanitizeQuerySchema(
	baseGetUsersQuerySchema,
).strict(); // Rejects unknown fields

// TypeScript types inferred from schemas
export type createUserInput = z.infer<typeof createUserSchema>;
export type loginInput = z.infer<typeof loginSchema>;
export type updateUserPutInput = z.infer<typeof putUserSchema>;
export type updateUserPatchInput = z.infer<typeof patchUserSchema>;
export type UpdateUserData = updateUserPutInput | updateUserPatchInput;
export type getUsersQuery = z.infer<typeof getUsersQuerySchema>;
