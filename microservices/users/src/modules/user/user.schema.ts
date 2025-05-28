import { z, ZodTypeAny, ZodObject } from "zod";

// MR_NOTE:
// '.regex()' is for pattern matching, and '.refine()' is for complex or cross-field logic.
// Also, '.refine()' is opaque to external consumers (e.g: database seeder script) so they
// CANNOT "import" them. but `.regex()` is NOT opaque, so they CAN import it.
// I could use `.refine()` for password constraint check logic (it cannot contain username, nickname, cannot be equal to email)
// But for that, the payload must have the fields to check.
// So for PATCH, it's not suitable since I could only PATCH password (and the other fields won't be present)

// Type definition for ordering (ascending/descending)
const sortDirections = ["asc", "desc"] as const;
const sortDirectionEnum = z.enum(sortDirections);
export type SortDirection = (typeof sortDirections)[number];

// Type definition for sorting by field (from User fields)
const userPublicFields = [
	"id",
	"email",
	"username",
	"nickname",
	"createdAt",
	"updatedAt",
] as const;
const userSortByEnum = z.enum(userPublicFields);
export type UserPublicField = (typeof userPublicFields)[number];

// Type definition to allow one field per query (used in )
export type UniqueUserField =
	// | { id: number }
	| { id: string }
	| { email: string }
	| { username: string }
	| { nickname: string };

// Type definition to allowing multiple User fields per query
export type UserField = Partial<
	Record<UserPublicField, string | number | Date>
>;

// Helper function to convert empty strings to undefined (Protection against invalid queries)
const blankToUndefined = <T extends z.ZodTypeAny>(
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
const sanitizeQuerySchema = <T extends ZodObject<any>>(schema: T): T => {
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
const usernameField = z
	.string({
		required_error: "Username is required",
		invalid_type_error: "Username must be a string",
	})
	// .min(3, "Username must be at least 3 characters long")
	// .refine((val) => val.trim().length > 0, {
	// 	message: "Username must not be empty or whitespace only",
	// })
	// .refine((val) => !/^\d+$/.test(val), {
	// 	message: "Username must not be numbers only",
	// })
	// .refine((val) => /[a-zA-Z]/.test(val), {
	// 	message: "Username must contain at least one letter",
	// });
	.min(3, "Username must be at least 3 characters long")
	.max(40, "Username cannot be longer than 40 characters")
	.regex(
		/^[a-z0-9_-]+$/,
		"Username can only contain lowercase letters, digits, dashes and underscores",
	)
	.regex(/[a-z]/, "Username must contain at least one letter");
// .regex(/\S/, "Username must not be empty or whitespace only")
// .regex(/\D/, "Username must not be numbers only")
// .regex(/[a-zA-Z]/, "Username must contain at least one letter");

// Nickname field schema
const nicknameField = z
	.string({
		required_error: "Nickname is required",
		invalid_type_error: "Nickname must be a string",
	})
	// .min(3, "Nickname must be at least 3 characters long")
	// .refine((val) => val.trim().length > 0, {
	// 	message: "Nickname must not be empty or whitespace only",
	// })
	// .refine((val) => !/^\d+$/.test(val), {
	// 	message: "Nickname must not be numbers only",
	// })
	// .refine((val) => /[a-zA-Z]/.test(val), {
	// 	message: "Nickname must contain at least one letter",
	// });
	.min(3, "Nickname must be at least 3 characters long")
	.max(70, "Nickname cannot be longer than 70 characters")
	.regex(/\S/, "Nickname cannot be empty or whitespace only")
	.regex(/[a-zA-Z]/, "Nickname must contain at least one letter")
	.regex(/^[\x00-\x7F]+$/, "Nickname must contain only ASCII characters")
	.regex(
		/^[^\s\x00-\x1F\x7F]+(?: [^\s\x00-\x1F\x7F]+)*$/,
		"Nickname cannot have leading or trailing whitespace or control characters",
	);

// Email field schema
const emailField = z
	.string({
		required_error: "Email is required",
		invalid_type_error: "Email must be a string",
	})
	.email()
	// .refine((val) => val === val.toLowerCase(), {
	// 	message: "Invalid email format",
	// });
	.min(6, "Email must be at least 6 characters long")
	.max(254, "Email must be at most 254 characters long")
	.regex(/^[^A-Z]+$/, "Email cannot contain uppercase letters")
	.regex(/^[\x00-\x7F]+$/, "Email must contain only ASCII characters")
	.refine((email) => {
		const [local, domain] = email.split("@");
		return local?.length >= 1 && local.length <= 64 && domain?.length >= 3;
	}, "Invalid email structure");

// Password field schema
const passwordField = z
	.string({
		required_error: "Password is required",
		invalid_type_error: "Password must be a string",
	})
	.min(6, "Password must be at least 6 characters long")
	// .refine(
	// 	(val) =>
	// 		/[a-z]/.test(val) && // lowercase
	// 		/[A-Z]/.test(val) && // uppercase
	// 		/\d/.test(val) && // digit
	// 		/[^a-zA-Z0-9]/.test(val), // symbol
	// 	{
	// 		message:
	// 			"Password must include at least one uppercase, one lowercase, one number, and one symbol",
	// 	},
	// );
	.max(100, "Password cannot be longer than 100 characters")
	// .regex(
	// 	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/,
	// 	"Password must include at least one uppercase, one lowercase, one number, and one symbol",
	// );
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/\d/, "Password must contain at least one digit")
	.regex(/[^a-zA-Z0-9]/, "Password must contain at least one symbol");

// Core user schema
// const userCore = {
const userCoreFields = {
	email: emailField.describe("User's email address"),
	// username: usernameField,
	nickname: nicknameField.describe("User's unique display nickname"),
};

// User authentication fields schema
const userAuthFields = {
	password: passwordField.describe("Password used for authentication"),
};

// User immutable fields schema
const userImmutableFields = {
	username: usernameField.describe("Permanent, unique username"),
};

// User metadata response fields schema
const userMetaFields = {
	id: z.string().uuid().describe("User ID (UUID format)"),
	createdAt: z.date().describe("Timestamp of user creation"),
	updatedAt: z.date().describe("Timestamp of last update"),
};

// Schema for createUser
export const createUserSchema = z
	.object({
		...userCoreFields,
		...userImmutableFields,
		...userAuthFields,
		// password: passwordField,
	})
	.strict();

// Schema for single user
export const userResponseSchema = z.object({
	// id: z.number(),
	// id: z.string().uuid(),
	...userMetaFields,
	...userImmutableFields,
	...userCoreFields,
});

// Schema to get a user by ID
export const userIdParamSchema = z
	.object({
		// id: blankToUndefined(z.coerce.number().min(1)),
		id: blankToUndefined(
			z.string().uuid().describe("User ID (UUID format)"),
		),
	})
	.strict(); // Rejects unknown fields

// Schema to update ALL user fields
// export const putUserSchema = createUserSchema;
export const putUserSchema = z
	.object({
		...userCoreFields,
		...userAuthFields,
	})
	.strict();

// Schema to update SOME user fields
export const patchUserSchema = putUserSchema.partial().strict(); // Rejects unknown fields

// Schema for login (Is possible to log in with email OR username, but not both)
export const loginSchema = z
	.object({
		email: z.string().email().optional(), // Optional because it could be use email OR username
		username: z
			.string()
			.min(3, "Username must be at least 3 character long") // Set min to avoid invalid request reach db
			.optional(), // Optional because it could be use username OR email
		password: z
			.string({
				required_error: "Password is required",
			})
			.min(6, "Password must be at least 6 character long"), // Set min to avoid invalid request reach db
	})
	.strict() // Rejects unknown fields
	// Refine the values (email OR username must be present, but NOT both)
	.refine(
		(data) =>
			(data.email || data.username) && !(data.email && data.username),
		{
			message: "Login requires a valid email or username",
			path: ["email"], // TODO: For Swagger UI display (check this)
		},
	);

// Schema for token payload
const tokenPayloadSchema = z.object({
	// === userMetaFields === //
	id: z.string().uuid().describe("User ID included in the token payload"),
	// createdAt: z
	// 	.date()
	// 	.describe("User creation timestamp included in the token payload"),
	// updatedAt: z
	// 	.date()
	// 	.describe("User last update timestamp included in the token payload"),
	// === userImmutableFields === //
	// username: usernameField.describe(
	// 	"User username included in the token payload",
	// ),
	// === userCoreFields === //
	// email: emailField.describe("User email included in the token payload"),
	nickname: nicknameField.describe(
		"User nickname included in the token payload",
	),
	// // ONLY FOR TESTING PURPOSES
	// // === userAuthFields === //
	// // (note that is 'passwordHash' and not 'password' (as is NOT a 'passwordField'), and 'salt' is not included in userAuthFields)
	// // passwordHash: z.string().describe("Hashed password (for testing only)"),
	// // salt: z.string().describe("Password salt (for testing only)"),
	// // role: z.enum(["admin", "user"]).describe("Optional: user role for authorization"),
});

// Schema for login response
// If the token contains more than what you send in the login response, we could do:
// export const loginResponseSchema = tokenPayloadSchema.pick({ id: true, nickname: true });
export const loginResponseSchema = tokenPayloadSchema.describe(
	"Response body after successful login, used by Auth service to generate the JWT payload",
);

// // Schema for login response
// export const loginResponseSchema = z
// 	.object({
// 		// accessToken: z.string(),
// 		id: z
// 			.string()
// 			.uuid()
// 			.describe("User ID (UUID) included in the access token"),
// 		nickname: nicknameField.describe(
// 			"Nickname displayed in the client and included in the token",
// 		),
// 	})
// 	.describe(
// 		"Response body after successful login, used by the Auth service to build the JWT payload",
// 	);

// Schema for array of users (for list responses)
export const userArrayResponseSchema = z.array(userResponseSchema);

// Base schema for query parameters
// Note that all fields will be marked with '.optional()' and "coerced"
// by getUsersQuerySchema = sanitizeQuerySchema(baseGetUsersQuerySchema);
const baseGetUsersQuerySchema = z.object({
	// id: z.string().uuid().describe("Exact match for user ID (UUID)"),
	id: z.string().describe("Find users by user ID (UUID)"),
	// email: z.string().email().describe("Exact match for user email"),
	email: z.string().describe("Find users by email"),
	username: z.string().describe("Find users by username"),
	nickname: z.string().describe("Find users by nickname"),
	createdAt: z
		.preprocess((val) => new Date(val as string), z.date())
		.describe(
			"Find users by createdAt (Remember to append 'Z' for UTC in fuzzy searches)",
		),
	updatedAt: z
		.preprocess((val) => new Date(val as string), z.date())
		.describe(
			"Find users by updatedAt (Remember to append 'Z' for UTC in fuzzy searches)",
		),
	// TODO: Make this as a type, and same for before, after and between
	dateTarget: z
		.enum(["createdAt", "updatedAt", "both"])
		.default("createdAt")
		.describe("Choose which date field to apply filters to"),
	before: z
		.preprocess((val) => new Date(val as string), z.date())
		.describe(
			"Find users created/updated before this date (Remember to append 'Z' for UTC in fuzzy searches)",
		),
	after: z
		.preprocess((val) => new Date(val as string), z.date())
		.describe(
			"Find users created/updated after this date (Remember to append 'Z' for UTC in fuzzy searches)",
		),
	between: z
		.preprocess(
			(val) =>
				Array.isArray(val)
					? val.map((d) => new Date(d as string))
					: undefined,
			z.tuple([
				z
					.date()
					.describe(
						"Start date (inclusive) (Remember to append 'Z' for UTC in fuzzy searches)",
					),
				z
					.date()
					.describe(
						"End date (inclusive) (Remember to append 'Z' for UTC in fuzzy searches)",
					),
			]),
		)
		.describe(
			"Find users between two dates (inclusive) (Remember to append 'Z' for UTC in fuzzy searches)",
		),
	useFuzzy: z
		.boolean()
		.describe("Enable fuzzy search (case-insensitive partial matches)"),
	useOr: z.boolean().describe("Use OR instead of AND for combining filters"),
	skip: z.number().min(0).describe("Number of records to skip"),
	take: z.number().min(1).max(100).describe("Number of records to return"),
	page: z
		.number()
		.min(1)
		.describe("Page number to use for pagination (starts at 1)"),
	all: z.boolean().describe("If true, return all results without pagination"),
	sortBy: userSortByEnum.default("createdAt"),
	order: sortDirectionEnum.default("asc"),
});

// Refined schema for query parameters to find users
export const getUsersQuerySchema = sanitizeQuerySchema(
	baseGetUsersQuerySchema,
).strict(); // Rejects unknown fields

// Schema for empty response (when requesting DELETE so I return 204 No content (No content returned))
export const emptyResponseSchema = z
	.void()
	.describe("User deleted successfully");

// // NEW: Standardized error response schema
export const errorResponseSchema = z.object({
	statusCode: z.number().describe("HTTP status code"),
	error: z
		.string()
		.describe("Short title describing the error (e.g., 'Not Found')"),
	message: z.string().describe("Detailed message about the error"),
});

// TypeScript types inferred from schemas
export type createUserInput = z.infer<typeof createUserSchema>;
export type loginInput = z.infer<typeof loginSchema>;
export type updateUserPutInput = z.infer<typeof putUserSchema>;
export type updateUserPatchInput = z.infer<typeof patchUserSchema>;
export type UpdateUserData = updateUserPutInput | updateUserPatchInput;
export type getUsersQuery = z.infer<typeof getUsersQuerySchema>;
