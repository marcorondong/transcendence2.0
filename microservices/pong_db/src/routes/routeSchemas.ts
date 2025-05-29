import {
	idZodSchema,
	idsZodSchema,
	userIdsZodSchema,
	gameSchema,
	gameHistoryResponseSchema,
	statsResponseSchema,
	usersStatsResponseSchema,
	successResponseSchema,
} from "./zodSchemas";

export const createGameSchema = {
	summary: "Create Game",
	description: "Create a new game record",
	tags: ["PONG-DB"],
	body: gameSchema,
	response: { 201: successResponseSchema },
};

export const gameHistorySchema = {
	summary: "Get Game History",
	description: "Get the game history for a specific user",
	tags: ["PONG-DB"],
	params: idZodSchema,
	response: { 200: gameHistoryResponseSchema },
};

export const userStatsSchema = {
	summary: "Get User Stats",
	description: "Get the user stats for a specific user",
	tags: ["PONG-DB"],
	params: idZodSchema,
	response: { 200: statsResponseSchema },
};

export const usersStatsSchema = {
	summary: "Get Users Stats",
	description: "Get the stats for multiple users",
	tags: ["PONG-DB"],
	body: userIdsZodSchema,
	response: { 200: usersStatsResponseSchema },
};

export const headToHeadSchema = {
	summary: "Get Head to Head Stats",
	description: "Get the head-to-head stats between two users",
	tags: ["PONG-DB"],
	params: idsZodSchema,
	response: { 200: statsResponseSchema },
};

export const healthCheckSchema = {
	summary: "Health Check",
	description: "Check the health of the service",
	tags: ["PONG-DB"],
	response: { 200: successResponseSchema },
};
