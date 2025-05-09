import { z, ZodTypeAny, ZodObject } from "zod";

// Type definition for ordering (ascending/descending)
const sortDirections = ["asc", "desc"] as const;
const sortDirectionEnum = z.enum(sortDirections);
export type SortDirection = (typeof sortDirections)[number];

// Type definition for sorting by field (from User fields)
const userPublicFields = ["id", "email", "username", "nickname"] as const;
const userSortByEnum = z.enum(userPublicFields);
export type UserPublicField = (typeof userPublicFields)[number];

// Type definition to allow one field per query (used in )
export type UniqueUserField =
	| { id: number }
	| { email: string }
	| { username: string }
	| { nickname: string };

// Type definition to allowing multiple User fields per query
export type UserField = Partial<Record<UserPublicField, string | number>>;

// Helper function to convert empty strings to undefined (Protection against invalid queries)
export const blankToUndefined = <T extends z.ZodTypeAny>(
	schema: T,
): z.ZodEffects<z.ZodOptional<T>, z.infer<T> | undefined, unknown> =>
	z.preprocess((val) => {
		if (typeof val === "string" && val.trim() === "") return undefined;
		// Coerce booleans (since .preprocess() removes coercion)
		if (schema instanceof z.ZodBoolean) {
			if (val === "true") return true;
			if (val === "false") return false;
		}
		// Coerce numbers (since .preprocess() removes coercion)
		if (schema instanceof z.ZodNumber && typeof val === "string") {
			const num = Number(val);
			if (!isNaN(num)) return num;
		}
		return val;
	}, schema.optional());

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

// Username field schema
export const usernameField = z
	.string({
		required_error: "Username is required",
		invalid_type_error: "Username must be a string",
	})
	.min(3, "Username must be at least 3 characters long")
	.refine((val) => val.trim().length > 0, {
		message: "Username must not be empty or whitespace only",
	})
	.refine((val) => !/^\d+$/.test(val), {
		message: "Username must not be numbers only",
	})
	.refine((val) => /[a-zA-Z]/.test(val), {
		message: "Username must contain at least one letter",
	});

// Nickname field schema
export const nicknameField = z
	.string({
		required_error: "Nickname is required",
		invalid_type_error: "Nickname must be a string",
	})
	.min(3, "Nickname must be at least 3 characters long")
	.refine((val) => val.trim().length > 0, {
		message: "Nickname must not be empty or whitespace only",
	})
	.refine((val) => !/^\d+$/.test(val), {
		message: "Nickname must not be numbers only",
	})
	.refine((val) => /[a-zA-Z]/.test(val), {
		message: "Nickname must contain at least one letter",
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
	username: usernameField,
	nickname: nicknameField,
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

// Base schema for query parameters
const baseGetUsersQuerySchema = z.object({
	id: z.coerce.number().min(1),
	email: z.string().email(),
	username: z.string(),
	nickname: z.string(),
	useFuzzy: z.coerce.boolean(),
	useOr: z.coerce.boolean(),
	skip: z.coerce.number().min(0),
	take: z.coerce.number().min(1).max(100),
	sortBy: userSortByEnum,
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
