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
export const createUserSchema = z
	.object({
		...userCore,
		password: z.string({
			required_error: "Password is required",
			invalid_type_error: "Password must be a string",
		}),
	})
	.strict(); // Rejects unknown fields

// Schema for single user
export const userResponseSchema = z.object({
	id: z.number(),
	...userCore,
});

// Schema to get a user by ID
export const userIdParamSchema = z
	.object({
		// id: z.number(),
		id: z.coerce.number(),
	})
	.strict(); //TODO: See if I have to use strict here too. Rejects unknown fields

// Schema to update all user fields
export const putUserSchema = z
	.object({
		...userCore,
		password: z.string({
			required_error: "Password is required",
			invalid_type_error: "Password must be a string",
		}),
	})
	.strict(); // Rejects unknown fields

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

// TODO: Try to "automate" SortBy according to UserField/UniqueUserField
// Schema for query parameters to find users
export const getUsersQuerySchema = z
	.object({
		id: z.coerce.number().optional(),
		email: z.string().email().optional(),
		name: z.string().optional(),
		useFuzzy: z.coerce.boolean().optional(),
		useOr: z.coerce.boolean().optional(),
		skip: z.coerce.number().min(0).optional(),
		take: z.coerce.number().min(1).max(100).optional(),
		sortBy: z.enum(["id", "email", "name"]).optional(),
		order: z.enum(["asc", "desc"]).optional(),
	})
	.strict(); // Rejects unknown fields

// TypeScript types inferred from schemas
export type createUserInput = z.infer<typeof createUserSchema>;
export type loginInput = z.infer<typeof loginSchema>;
export type updateUserPutInput = z.infer<typeof putUserSchema>; // TODO: Should I export this? (putUserInput)
export type updateUserPatchInput = z.infer<typeof patchUserSchema>; // TODO: Should I export this? (patchUserInput)
export type UpdateUserData = updateUserPutInput | updateUserPatchInput;
export type getUsersQuery = z.infer<typeof getUsersQuerySchema>;
// export type UserResponse = z.infer<typeof userResponseSchema>; // TODO: This is not used yet (I don't have an endpoint to retrieve single user)
// export type UserArrayResponse = z.infer<typeof userArrayResponseSchema>;
