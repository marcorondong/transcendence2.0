import { z } from "zod";

export const wsZodParamSchema = z.object({
	userName: z.string(),
});

export const wsZodMessageSchema = z.object({
	sender: z.string(),
	receiver: z.string(),
	message: z.string(),
});

export const wsZodResponseSchema = z.object({
	userName: z.string(),
	friendName: z.string(),
	message: z.string(),
});

export const wsZodNotificationSchema = z.object({
	userName: z.string(),
	friendName: z.string(),
	notification: z.any(),
});

export const wsZodNotificationResponseSchema = z.object({
	userName: z.string(),
	friendName: z.string(),
	notification: z.any(),
	message: z.string().default("Successfully done"),
});

export type wsInput = z.infer<typeof wsZodParamSchema>;
export type wsMessageInput = z.infer<typeof wsZodMessageSchema>;
