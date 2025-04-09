import { z } from "zod";

export const sessionZodSchema = z.object({
	userName: z.string(),
});

export const sessionZodResponseSchema = z.object({
	userName: z.string(),
	message: z.string().default("Successfully done"),
});

export const standardZodSchema = z.object({
	userName: z.string(),
	friendName: z.string(),
});

export const standardZodResponseSchema = z.object({
	userName: z.string(),
	friendName: z.string(),
	message: z.string().default("Successfully done"),
});

export const chatHistoryResponseSchema = z.object({
	userName: z.string(),
	chatPartner: z.string(),
	chatHistory: z.any(),
	blockButton: z.boolean(),
	message: z.string().default("Successfully done"),
});

export type sessionInput = z.infer<typeof sessionZodSchema>;
export type standardInput = z.infer<typeof standardZodSchema>;
