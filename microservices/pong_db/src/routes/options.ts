import {
	createGameSchema,
	gameHistorySchema,
	userStatsSchema,
	usersStatsSchema,
	headToHeadSchema,
	healthCheckSchema,
} from "./routeSchemas";
import {
	createGameHandler,
	gameHistoryHandler,
	userStatsHandler,
	usersStatsHandler,
	headToHeadHandler,
	healthCheckHandler,
} from "./controllers";

export const createGameOpt = {
	schema: createGameSchema,
	handler: createGameHandler,
};

export const gameHistoryOpt = {
	schema: gameHistorySchema,
	handler: gameHistoryHandler,
};

export const userStatsOpt = {
	schema: userStatsSchema,
	handler: userStatsHandler,
};

export const usersStatsOpt = {
	schema: usersStatsSchema,
	handler: usersStatsHandler,
};

export const headToHeadOpt = {
	schema: headToHeadSchema,
	handler: headToHeadHandler,
};

export const healthCheckOpt = {
	schema: healthCheckSchema,
	handler: healthCheckHandler,
};
