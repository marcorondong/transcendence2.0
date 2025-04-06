import { z } from "zod";

// MR_NOTE: In Zod, everything is required by default.

// Core user schema
const userCore = {
	email: z
		.string({
			required_error: "Email is required",
			invalid_type_error: "Email must be a string",
		})
		.email(),
	name: z.string(),
};

// Schema for createUser
export const createUserSchema = z.object({
	...userCore,
	password: z.string({
		required_error: "Password is required",
		invalid_type_error: "Password must be a string",
	}),
});

// Schema for single user
export const userResponseSchema = z.object({
	id: z.number(),
	...userCore,
});

// Schema to get a user by ID
export const userIdParamSchema = z.object({
	id: z.number(),
});

// Schema to update all user fields
export const putUserSchema = z.object({
	...userCore,
	password: z.string({
		required_error: "Password is required",
		invalid_type_error: "Password must be a string",
	}),
});

// Schema to update some user fields
export const patchUserSchema = putUserSchema.partial();

// Schema for login
export const loginSchema = z.object({
	email: z
		.string({
			required_error: "Email is required",
			invalid_type_error: "Email must be a string",
		})
		.email(),
	password: z.string(),
});

// Schema for login response
export const loginResponseSchema = z.object({
	accessToken: z.string(),
});

// Schema for array of users (for list responses)
export const userArrayResponseSchema = z.array(userResponseSchema);

// TypeScript types inferred from schemas
export type createUserInput = z.infer<typeof createUserSchema>;
export type loginInput = z.infer<typeof loginSchema>;
// export type UserResponse = z.infer<typeof userResponseSchema>; // TODO: This is not used yet (I don't have an endpoint to retrieve single user)
// export type UserArrayResponse = z.infer<typeof userArrayResponseSchema>;
