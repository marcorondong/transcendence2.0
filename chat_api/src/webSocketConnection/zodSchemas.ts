import { z } from "zod";

export const terminateSchema = z
	.object({
		type: z.literal("terminate"),
	})
	.strict();

export const messageSchema = z
	.object({
		type: z.literal("message"),
		message: z.string(),
		relatedId: z.string(),
	})
	.strict();

export const messageResponseSchema = z
	.object({
		type: z.literal("messageResponse"),
		message: z.string(),
		relatedId: z.string(),
	})
	.strict();

export const blockSchema = z
	.object({
		type: z.literal("block"),
		relatedId: z.string(),
	})
	.strict();

export const blockResponseSchema = z
	.object({
		type: z.literal("blockResponse"),
		relatedId: z.string().optional(),
		notification: z.string().optional(),
	})
	.strict();

export const blockStatusSchema = z
	.object({
		type: z.literal("blockStatus"),
		relatedId: z.string(),
	})
	.strict();

export const blockStatusResponseSchema = z
	.object({
		type: z.literal("blockStatusResponse"),
		blockStatus: z.boolean(),
		relatedId: z.string(),
		notification: z.string().optional(),
	})
	.strict();

export const blockListSchema = z
	.object({
		blockList: z.array(z.string()),
	})
	.strict();

export const newClientResponseSchema = z
	.object({
		type: z.literal("newClient"),
		relatedId: z.string(),
		notification: z.string().optional(),
	})
	.strict();

export const peopleOnlineResponseSchema = z
	.object({
		type: z.literal("peopleOnline"),
		peopleOnline: z.array(z.string()),
		notification: z.string().optional(),
	})
	.strict();

export const inviteSchema = z
	.object({
		type: z.literal("invite"),
		relatedId: z.string(),
	})
	.strict();

export const inviteResponseSchema = z
	.object({
		type: z.literal("inviteResponse"),
		relatedId: z.string(),
		roomId: z.string(),
		notification: z.string().optional(),
	})
	.strict();

export const DataSchema = z.discriminatedUnion("type", [
	terminateSchema,
	messageSchema,
	blockSchema,
	blockStatusSchema,
	inviteSchema,
]);

export type DataInput = z.infer<typeof DataSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type BlockInput = z.infer<typeof blockSchema>;
export type BlockStatusInput = z.infer<typeof blockStatusSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;
export type TerminateInput = z.infer<typeof terminateSchema>;
