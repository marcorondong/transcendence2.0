import {gamesSchema, totalSchema, headToHeadSchema} from './game.schemas';
import { gamesHandler, totalHandler, headToHeadHandler } from './game.controllers';
import { he } from '@faker-js/faker/.';

export const gamesOpt = {
	schema: gamesSchema,
	handler: gamesHandler,
};

export const totalOpt = {
	schema: totalSchema,
	handler: totalHandler,
};

export const headToHeadOpt = {
	schema: headToHeadSchema,
	handler: headToHeadHandler,
};

