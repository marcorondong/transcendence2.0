import { z } from "zod";

export const userZodSchema = z
	.object({
		id: z.string().uuid(),
		nickname: z.string().min(1),
	})
	.strict();

const indexSchema = z
	.number()
	.int()
	.nonnegative()
	.min(0, { message: "Index must be at least 0" })
	.max(8, { message: "Index must be at most 8" });

export const zodSchema = z
	.object({
		index: indexSchema,
	})
	.strict();

export const zodIdSchema = z
	.object({
		id: z.string().uuid(),
	})
	.strict();

export const statsSchema = z
	.object({
		total: z.number().int().nonnegative(),
		wins: z.number().int().nonnegative(),
		losses: z.number().int().nonnegative(),
		draws: z.number().int().nonnegative(),
	})
	.strict()
	.refine((data) => data.total === data.wins + data.losses + data.draws);

export const zodIndexResponse = z
	.object({
		index: indexSchema,
		sign: z.enum(["X", "O"]),
		turn: z.enum(["Your turn", "Opponent's turn"]),
	})
	.strict();

export const zodSetupResponse = z
	.object({
		gameSetup: z.literal(true),
		userId: z.string().uuid(),
		opponentId: z.string().uuid(),
		sign: z.enum(["X", "O"]),
		turn: z.enum(["Your turn", "Opponent's turn"]),
		wins: z.number().int().nonnegative(),
		losses: z.number().int().nonnegative(),
		draws: z.number().int().nonnegative(),
		total: z.number().int().nonnegative(),
	})
	.strict()
	.refine((data) => data.total === data.wins + data.losses + data.draws)
	.refine((data) => data.userId !== data.opponentId);

export const zodWarningResponse = z
	.object({
		warning: z.string(),
	})
	.strict();

export const zodErrorResponse = z
	.object({
		error: z.string(),
	})
	.strict();

export const zodGameOverResponse = z
	.object({
		gameOver: z.string(),
	})
	.strict();
