import {
	gamesSchema,
	totalStatsSchema,
	headToHeadSchema,
	createGameSchema,
} from "./routeSchemas";
import {
	gamesHandler,
	totalStatsHandler,
	headToHeadHandler,
	createGameHandler,
} from "./controllers";

export const gamesOpt = {
	schema: gamesSchema,
	handler: gamesHandler,
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
