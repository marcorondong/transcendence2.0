import {
	gameHistorySchema,
	totalStatsSchema,
	headToHeadSchema,
	createGameSchema,
	healthCheckSchema,
} from "./routeSchemas";
import {
	gameHistoryHandler,
	totalStatsHandler,
	headToHeadHandler,
	createGameHandler,
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

export const totalStatsOpt = {
	schema: totalStatsSchema,
	handler: totalStatsHandler,
};

export const headToHeadOpt = {
	schema: headToHeadSchema,
	handler: headToHeadHandler,
};

export const healthCheckOpt = {
	schema: healthCheckSchema,
	handler: healthCheckHandler,
};
