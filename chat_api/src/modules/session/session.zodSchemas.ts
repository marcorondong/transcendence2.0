import { z } from 'zod';

export const sessionSchema = z.object({
	userName: z.string(),
});

export const sessionResponseSchema = z.object({
	userName: z.string(),
	message: z.string().default('Successfully done'),
});

export const standardSchema = z.object({
	userName: z.string(),
	friendName: z.string(),
});

export const standardResponseSchema = z.object({
	userName: z.string(),
	friendName: z.string(),
	message: z.string().default('Successfully done'),
});

export const chatHistoryResponseSchema = z.object({
	userName: z.string(),
	chatPartner: z.string(),
	chatHistory: z.any(),
	blockButton: z.boolean(),
	message: z.string().default('Successfully done'),
});

export type sessionInput = z.infer<typeof sessionSchema>;
export type standardInput = z.infer<typeof standardSchema>;
