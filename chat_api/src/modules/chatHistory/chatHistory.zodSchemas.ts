import { z } from "zod";

export const chatHistoryZodSchema = z.object({
	userName: z.string(),
	friendName: z.string(),
});

export const chatHistoryResponseZodSchema = z.object({
	chatHistory: z.any().array(),
	blockButton: z.boolean(),
});

export type ChatHistoryInput = z.infer<typeof chatHistoryZodSchema>;
