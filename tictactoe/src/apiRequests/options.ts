import {gamesSchema, totalStatsSchema, headToHeadSchema} from './routeSchemas';
import { gamesHandler, totalStatsHandler, headToHeadHandler } from './controllers';

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

