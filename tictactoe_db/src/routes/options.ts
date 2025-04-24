import {
	createGameSchema,
	gameHistorySchema,
	totalStatsSchema,
	headToHeadSchema,
	healthCheckSchema,
} from "./routeSchemas";
import {
	createGameHandler,
	gameHistoryHandler,
	totalStatsHandler,
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
