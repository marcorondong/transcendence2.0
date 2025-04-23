import {
	idZodSchema,
	idsZodSchema,
	gameHistoryResponseSchema,
	statsResponseSchema,
	successResponseSchema,
} from "./zodSchemas";

export const gameHistorySchema = {
	summary: "Get Game History",
	description: "Get the game history for a specific user",
	tags: ["Game"],
	params: idZodSchema,
	response: { 200: gameHistoryResponseSchema },
};

export const totalStatsSchema = {
	summary: "Get Total Stats",
	description: "Get the total stats for a specific user",
	tags: ["Game"],
	params: idZodSchema,
	response: { 200: statsResponseSchema },
};

export const headToHeadSchema = {
	summary: "Get Head to Head Stats",
	description: "Get the head-to-head stats between two users",
	tags: ["Game"],
	params: idsZodSchema,
	response: { 200: statsResponseSchema },
};

export const createGameSchema = {
	summary: "Create Game",
	description: "Create a new game record",
	tags: ["Game"],
	body: idsZodSchema,
	response: { 201: successResponseSchema },
};

export const deleteIdSchema = {
	summary: "Delete Game ID",
	description: "Delete a game record by ID",
	tags: ["Game"],
	body: idZodSchema,
	response: { 200: successResponseSchema },
};
