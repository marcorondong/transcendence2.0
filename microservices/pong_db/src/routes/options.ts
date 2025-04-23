import {
	gameHistorySchema,
	totalStatsSchema,
	headToHeadSchema,
	createGameSchema,
} from "./routeSchemas";
import {
	gameHistoryHandler,
	totalStatsHandler,
	headToHeadHandler,
	createGameHandler,
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
