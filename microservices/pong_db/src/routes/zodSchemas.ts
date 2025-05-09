import { z } from "zod";

export const idZodSchema = z
	.object({
		userId: z.string().min(1), // TODO .uuid(),
	})
	.strict()

export const idsZodSchema = z
	.object({
		userId: z.string().min(1), // TODO .uuid(),
		opponentId: z.string().min(1), // TODO .uuid(),
	})
	.strict()
	.refine((data) => data.userId !== data.opponentId);

const baseSchema = z.object({
	winnerId: z.string().min(1), // TODO .uuid(),
	loserId: z.string().min(1), // TODO .uuid(),
	winnerScore: z.number().int().nonnegative(),
	loserScore: z.number().int().nonnegative(),
});

export const gameSchema = baseSchema
		.extend({
			gameId: z.string().uuid("Invalid game ID format"),
		})
		.strict()
		.refine((data) => data.winnerId !== data.loserId)
		.refine((data) => data.winnerScore > data.loserScore);
	
const gameResponseSchema = baseSchema
		.extend({
			createdAt: z.date(),
		})
		.strict();

export const gameHistoryResponseSchema = z.array(gameResponseSchema);

export const statsResponseSchema = z
	.object({
		total: z.number().int().nonnegative(),
		wins: z.number().int().nonnegative(),
		losses: z.number().int().nonnegative(),
	})
	.strict();

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
