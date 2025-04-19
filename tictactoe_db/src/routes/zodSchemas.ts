import { z } from "zod";

export const idZodSchema = z.object({
	id: z.string(), //TODO: merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
});

const gameSchema = z.object({
	id: z.string().uuid(),
	playerXId: z.string(),
	playerOId: z.string(),
	result: z.enum(["X", "O", "DRAW"]),
});

export const gamesResponseSchema = z.array(gameSchema);

export const statsResponseSchema = z.object({
	wins: z.number(),
	losses: z.number(),
	draws: z.number(),
});

export const headToHeadZodSchema = z.object({
	id: z.string(), //TODO: merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
	opponentId: z.string(), //TODO: merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
});

export const createGameZodSchema = z.object({
	playerXId: z.string(), //TODO: merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
	playerOId: z.string(), //TODO: merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
	result: z.enum(["X", "O", "DRAW"]),
});

export type IdParams = z.infer<typeof idZodSchema>;
export type HeadToHeadParams = z.infer<typeof headToHeadZodSchema>;
