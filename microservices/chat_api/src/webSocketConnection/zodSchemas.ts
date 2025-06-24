import { z } from "zod";

export const userZodSchema = z
	.object({
		id: z.string().uuid(),
		nickname: z.string().min(1),
	})
	.strict();

export const messageSchema = z
	.object({
		type: z.literal("message"),
		id: z.string().uuid(),
		message: z.string(),
	})
	.strict();

export const messageResponseSchema = z
	.object({
		type: z.literal("message"),
		sender: userZodSchema,
		receiver: userZodSchema,
		message: z.string(),
	})
	.strict()
	.refine((data) => data.sender.id !== data.receiver.id)
	.refine((data) => data.sender.nickname !== data.receiver.nickname);

export const inviteSchema = z
	.object({
		type: z.literal("invite"),
		id: z.string().uuid(),
	})
	.strict();

export const inviteResponseSchema = z
	.object({
		type: z.literal("invite"),
		user: userZodSchema,
		roomId: z.string().uuid(),
	})
	.strict();

export const onlineUsersResponseSchema = z
	.object({
		type: z.literal("onlineUsers"),
		users: z.array(userZodSchema),
		me: userZodSchema,
	})
	.strict();

export const newUserResponseSchema = z
	.object({
		type: z.literal("newUser"),
		user: userZodSchema,
	})
	.strict();

export const updateNicknameSchema = z
	.object({
		type: z.literal("updateNickname"),
	})
	.strict()

export const updateNicknameResponseSchema = z
	.object({
		type: z.literal("updateNickname"),
		user: userZodSchema,
	})
	.strict();

export const disconnectedResponseSchema = z
	.object({
		type: z.literal("disconnected"),
		user: userZodSchema,
	})
	.strict();

export const errorResponseSchema = z
	.object({
		type: z.literal("error"),
		errorMessage: z.string(),
	})
	.strict();

export const blockStatusSchema = z
	.object({
		blockStatus: z.boolean(),
	})
	.strict();

export const roomIdSchema = z
	.object({
		roomId: z.string().uuid(),
	})
	.strict();

export const DataSchema = z.discriminatedUnion("type", [
	messageSchema,
	inviteSchema,
	updateNicknameSchema,
]);

export type DataInput = z.infer<typeof DataSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;
