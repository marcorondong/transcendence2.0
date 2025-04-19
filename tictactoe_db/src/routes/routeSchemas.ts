import {
	idZodSchema,
	gamesResponseSchema,
	statsResponseSchema,
	headToHeadZodSchema,
	createGameZodSchema,
} from "./zodSchemas";

export const gamesSchema = {
	summary: "Get all games for a player",
	description: "Fetches all games associated with a specific player ID.",
	tags: ["tictactoe"],
	params: idZodSchema,
	response: {
		200: gamesResponseSchema,
	},
};

export const totalStatsSchema = {
	summary: "Get total statistic for a player (wins, losses, draws)",
	description: "Fetches the total statistics for a player based on their ID.",
	tags: ["tictactoe"],
	params: idZodSchema,
	response: {
		200: statsResponseSchema,
	},
};

export const headToHeadSchema = {
	summary: "Get head-to-head statistics between two players",
	description:
		"Fetches the head-to-head statistics between two players based on their IDs.",
	tags: ["tictactoe"],
	params: headToHeadZodSchema,
	response: {
		200: statsResponseSchema,
	},
};

export const createGameSchema = {
	summary: "Create a new game",
	description: "Creates a new game with the specified players and result.",
	tags: ["tictactoe"],
	body: createGameZodSchema,
	// response: {
	// 	201: createGameZodSchema,
	// },
};
