import { string, z } from "zod";

// Core user schema
const userCore = {
	email: z.string({
		required_error: "Email is required",
		invalid_type_error: "Email must be a string",
	}).email(),
	name: z.string(),
}

// Schema for createUser
export const createUserSchema = z.object({
	...userCore,
	password: z.string({
		required_error: "Password is required",
		invalid_type_error: "Password must be a string",
	}),
});

// Schema for createUser response
export const createUserResponseSchema = z.object({
	id: z.number(),
	...userCore,
});

// Schema for login
// MR_NOTE: In Zod, everything is required by default.
export const loginSchema = z.object({
	email: z.string({
		required_error: "Email is required",
		invalid_type_error: "Email must be a string",
	}).email(),
	password: z.string(),
})

// Schema for login response
export const loginResponseSchema = z.object({
	accessToken: z.string(),
})

// Schema for a single user 
export const userResponseSchema = z.object({
	id: z.number(),
	...userCore,
});

// Schema for an array of users (for list responses)
export const userArrayResponseSchema = z.array(userResponseSchema);

// TypeScript types inferred from schemas
export type createUserInput = z.infer<typeof createUserSchema>;
export type loginInput = z.infer<typeof loginSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UserArrayResponse = z.infer<typeof userArrayResponseSchema>;