import { z } from "zod";

export const idZodSchema = z
	.object({
		userId: z.string().uuid(),
	})
	.strict();

export const idsZodSchema = z
	.object({
		userId: z.string().uuid(),
		friendId: z.string().uuid(),
	})
	.strict()
	.refine((data) => data.userId !== data.friendId);

export const blockStatusResponseSchema = z
	.object({
		blockStatus: z.boolean(),
	})
	.strict();

export const blockListResponseSchema = z
	.object({
		blockList: z.array(idZodSchema),
	})
	.strict();

export const successResponseSchema = z
	.object({
		success: z.boolean(),
	})
	.strict();

export type IdInput = z.infer<typeof idZodSchema>;
export type IdsInput = z.infer<typeof idsZodSchema>;
