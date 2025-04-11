import { z } from "zod";

export const getFriendListZodSchema = z.object({
	userName: z.string(),
});

export const standardFriendListZodSchema = z.object({
	userName: z.string(),
	friendName: z.string(),
});

export const getFriendListResponseSchema = z.object({
	friendList: z.array(z.string()),
});

export const standardFriendListResponseSchema = z.object({
	message: z.string().default("Successfully done"),
});

export type GetFriendListInput = z.infer<typeof getFriendListZodSchema>;
export type StandardFriendListInput = z.infer<
	typeof standardFriendListZodSchema
>;
