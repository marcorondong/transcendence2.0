import { z } from "zod";

// Core user schema
const userCore = {
	email: z.string({
		required_error: "Email is required",
		invalid_type_error: "Email must be a string",
	}).email(),
	name: z.string(),
}

// Schema for creating a user
export const createUserSchema = z.object({
	...userCore,
	password: z.string({
		required_error: "Password is required",
		invalid_type_error: "Password must be a string",
	}),
});

// Schema for user response
export const createUserResponseSchema = z.object({
	id: z.number(),
	...userCore,
});

// Type for input validation
export type createUserInput = z.infer<typeof createUserSchema>;