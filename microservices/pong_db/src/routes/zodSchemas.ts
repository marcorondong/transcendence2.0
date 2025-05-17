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

const baseSchema = z.object({
	winnerId: z.string().uuid(),
	loserId: z.string().uuid(),
	winnerScore: z.number().int().nonnegative(),
	loserScore: z.number().int().nonnegative(),
});

export const gameSchema = baseSchema
	.extend({
		gameId: z.string().uuid(),
	})
	.strict()
	.refine((data) => data.winnerId !== data.loserId)
	.refine((data) => data.winnerScore > data.loserScore);

const gameResponseSchema = baseSchema
	.extend({
		createdAt: z.date(),
	})
	.strict()
	.refine((data) => data.winnerId !== data.loserId)
	.refine((data) => data.winnerScore > data.loserScore);

export const gameHistoryResponseSchema = z.array(gameResponseSchema);

export const statsResponseSchema = z
	.object({
		total: z.number().int().nonnegative(),
		wins: z.number().int().nonnegative(),
		losses: z.number().int().nonnegative(),
	})
	.strict()
	.refine((data) => data.total === data.wins + data.losses);

export const successResponseSchema = z
	.object({
		success: z.boolean(),
	})
	.strict();

export type IdInput = z.infer<typeof idZodSchema>;
export type IdsInput = z.infer<typeof idsZodSchema>;
export type GameInput = z.infer<typeof gameSchema>;
export type GamesInput = z.infer<typeof gameHistoryResponseSchema>;
export type GameResponse = z.infer<typeof gameResponseSchema>;
export type StatsInput = z.infer<typeof statsResponseSchema>;
