import { z } from "zod";

export const idZodSchema = z.object({
	id: z.string(), // TODO merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
});

export const idsZodSchema = z.object({
	id: z.string(), // TODO merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
	friendId: z.string(), // TODO merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
});

export const blockStatusResponseSchema = z.object({
	blockStatus: z.boolean(),
});

export const blockListResponseSchema = z.object({
	blockList: z.array(z.string()), // TODO merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
});

// const chatMessageSchema = z.object({
// 	message: z.string(),
// 	sender: z.string(), // TODO merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
// });

// export const chatHistoryResponseSchema = z.object({
// 	chatHistory: z.array(chatMessageSchema),
// 	blockButton: z.boolean(),
// });

export type IdInput = z.infer<typeof idZodSchema>;
export type IdsInput = z.infer<typeof idsZodSchema>;
