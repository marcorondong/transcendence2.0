import { z } from "zod";

export const idZodSchema = z.object({
	userId: z.string().min(1, "User ID cannot be empty"), // TODO merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
}).strict();

export const idsZodSchema = z.object({
	userId: z.string().min(1, "User ID cannot be empty"), // TODO merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
	friendId: z.string().min(1, "User ID cannot be empty"), // TODO merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
}).strict();

export const blockStatusResponseSchema = z.object({
	blockStatus: z.boolean(),
}).strict();

const blockListSchema = z.object({
	userId: z.string().min(1, "User ID cannot be empty"), // TODO merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
}).strict();

export const blockListResponseSchema = z.object({
	blockList: z.array(blockListSchema),
}).strict();

export type IdInput = z.infer<typeof idZodSchema>;
export type IdsInput = z.infer<typeof idsZodSchema>;
