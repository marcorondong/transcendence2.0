import { z } from "zod";

export const idZodSchema = z
	.object({
		userId: z.string().min(1, "User ID cannot be empty"), // TODO merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
	})
	.strict();

export const idsZodSchema = z
	.object({
		userId: z.string().min(1, "User ID cannot be empty"), // TODO merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
		opponentId: z.string().min(1, "User ID cannot be empty"), // TODO merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
	})
	.strict();

const resultZodSchema = z.enum(["X", "O", "DRAW"]);

export const gameSchema = z
	.object({
		playerXId: z.string().min(1, "playerXId cannot be empty"), // TODO merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
		playerOId: z.string().min(1, "playerOId ID cannot be empty"),
		result: resultZodSchema,
	})
	.strict();

export const gameHistoryResponseSchema = z.array(gameSchema);

export const statsResponseSchema = z
	.object({
		total: z.number().int().nonnegative(),
		wins: z.number().int().nonnegative(),
		losses: z.number().int().nonnegative(),
		draws: z.number().int().nonnegative(),
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
export type StatsInput = z.infer<typeof statsResponseSchema>;
export type ResultInput = z.infer<typeof resultZodSchema>;
