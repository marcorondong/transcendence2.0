import {
	idZodSchema,
	idsZodSchema,
	gameSchema,
	gameHistoryResponseSchema,
	statsResponseSchema,
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

export const totalStatsSchema = {
	summary: "Get Total Stats",
	description: "Get the total stats for a specific user",
	tags: ["PONG-DB"],
	params: idZodSchema,
	response: { 200: statsResponseSchema },
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
