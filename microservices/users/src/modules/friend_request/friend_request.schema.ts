import { z } from "zod";

// TODO: Add later the `.describe()`

// Schema to send friend request
export const sendFriendRequestSchema = z
	.object({
		fromId: z.string().uuid(),
		toId: z.string().uuid(),
		message: z.string().min(1).max(255),
	})
	.strict();

// Schema to get a friendRequest by ID
export const friendRequestIdParamSchema = z
	.object({
		id: z.string().uuid().describe("Friend Request ID"),
	})
	.strict();

// Schema for single friendRequest
export const friendRequestResponseSchema = z
	.object({
		id: z.string().uuid(),
		fromId: z.string().uuid(),
		toId: z.string().uuid(),
		message: z.string(),
		createdAt: z.string().datetime(),
	})
	.strict();

// Schema for array of friendRequest (for list responses)
export const friendRequestArrayResponseSchema = z.array(
	friendRequestResponseSchema,
);

// Schema to accept friend request (must explicitly say "accept")
export const acceptFriendRequestBodySchema = z
	.object({
		accept: z.literal(true),
	})
	.strict();

export const errorResponseSchema = z.object({
	statusCode: z.number().describe("HTTP status code"),
	code: z.string().describe("Error string code"),
	message: z.string().describe("Detailed message about the error"),
	// Don't send these. Already printed in the terminal.
	// If I send them, I'm exposing internal code structure.
	// service: z.string().describe("Service that threw the error"),
	// type: z.string().describe("Error type/class"),
	// handler: z
	// 	.string()
	// 	.describe("Function that caught the error (handler function)"),
	// stack: z.string().describe("stack calls"),
	// nestedCause: z.any().describe("Original error object or nested AppError"),
});

// Schema for empty response (when requesting DELETE so I return 204 No content (No content returned))
export const emptyResponseSchema = z
	.void()
	.describe("friend request deleted successfully");

// TypeScript types inferred from schemas
export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;
export type AcceptFriendRequestInput = z.infer<
	typeof acceptFriendRequestBodySchema
>;
