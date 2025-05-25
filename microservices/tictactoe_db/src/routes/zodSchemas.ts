import { z } from "zod";

export const idZodSchema = z
	.object({
		userId: z.string().uuid(),
	})
	.strict();

export const idsZodSchema = z
	.object({
		userId: z.string().uuid(),
		opponentId: z.string().uuid(),
	})
	.strict()
	.refine((data) => data.userId !== data.opponentId);

const resultZodSchema = z.enum(["X", "O", "DRAW"]);

export const gameSchema = z
	.object({
		playerXId: z.string().uuid(),
		playerOId: z.string().uuid(),
		result: resultZodSchema,
	})
	.strict()
	.refine((data) => data.playerXId !== data.playerOId);

export const gameHistoryResponseSchema = z.array(gameSchema);

export const statsResponseSchema = z
	.object({
		total: z.number().int().nonnegative(),
		wins: z.number().int().nonnegative(),
		losses: z.number().int().nonnegative(),
		draws: z.number().int().nonnegative(),
	})
	.strict()
	.refine((data) => data.total === data.wins + data.losses + data.draws);

export const successResponseSchema = z
	.object({
		success: z.boolean(),
	})
	.strict();

export type IdInput = z.infer<typeof idZodSchema>;
export type IdsInput = z.infer<typeof idsZodSchema>;
export type GameInput = z.infer<typeof gameSchema>;
export type GamesInput = z.infer<typeof gameHistoryResponseSchema>;
export type StatsInput = z.infer<typeof statsResponseSchema>;
export type ResultInput = z.infer<typeof resultZodSchema>;
