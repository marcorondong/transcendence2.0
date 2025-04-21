import { z } from "zod";

export const idZodSchema = z.object({
	userId: z.string().min(1, "User ID cannot be empty"), // TODO merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
});

export const idsZodSchema = z.object({
	userId: z.string().min(1, "User ID cannot be empty"), // TODO merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
	friendId: z.string().min(1, "User ID cannot be empty"), // TODO merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
});

export const blockStatusResponseSchema = z.object({
	blockStatus: z.boolean(),
});

const blockListSchema = z.object({
	userId: z.string().min(1, "User ID cannot be empty"), // TODO merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
});

export const blockListResponseSchema = z.object({
	blockList: z.array(blockListSchema),
});

export type IdInput = z.infer<typeof idZodSchema>;
export type IdsInput = z.infer<typeof idsZodSchema>;
