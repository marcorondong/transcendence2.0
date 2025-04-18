import { z } from "zod";

export const gamesZodSchema = z.object({
	id: z.string(), //TODO: merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
});



const gameSchema = z.object({
	id: z.string().uuid(),
	playerXId: z.string(),
	playerOId: z.string(),
	result: z.enum(["X", "O", "Draw"]),
});

export const gamesResponseSchema = z.array(gameSchema);

export const totalResponseSchema = z.object({
	wins: z.number(),
	losses: z.number(),
	draws: z.number(),
});

export const headToHeadZodSchema = z.object({
	id: z.string(), //TODO: merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
	opponentId: z.string(), //TODO: merge this line when id is provided in JWT: .uuid("Invalid player ID format"),
});

export type GamesParams = z.infer<typeof gamesZodSchema>;
export type HeadToHeadParams = z.infer<typeof headToHeadZodSchema>;
