import {
	gameHistorySchema,
	totalStatsSchema,
	headToHeadSchema,
	createGameSchema,
	deleteIdSchema,
} from "./routeSchemas";
import {
	gameHistoryHandler,
	totalStatsHandler,
	headToHeadHandler,
	createGameHandler,
	deleteIdHandler,
} from "./controllers";

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

export const createGameOpt = {
	schema: createGameSchema,
	handler: createGameHandler,
};

export const deleteIdOpt = {
	schema: deleteIdSchema,
	handler: deleteIdHandler,
};

