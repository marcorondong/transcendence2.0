
import { gamesZodSchema, gamesResponseSchema, totalResponseSchema, headToHeadZodSchema } from './game.zodSchemas';

export const gamesSchema = {
	summary: "Get all games for a player",
	description: "Fetches all games associated with a specific player ID.",
	tags: ["tictactoe"],
	params: gamesZodSchema,	
	response: {
		200: gamesResponseSchema,
	},
};

export const totalSchema = {
	summary: "Get total statistic for a player (wins, losses, draws)",
	description: "Fetches the total statistics for a player based on their ID.",
	tags: ["tictactoe"],
	params: gamesZodSchema,
	response: {
		200: totalResponseSchema,
	},
};

export const headToHeadSchema = {
	summary: "Get head-to-head statistics between two players",
	description: "Fetches the head-to-head statistics between two players based on their IDs.",
	tags: ["tictactoe"],
	params: headToHeadZodSchema,
	response: {
		200: totalResponseSchema,
	},
}