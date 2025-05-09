
import { z } from 'zod';

const envZodSchema = z
	.object({
		PORT: z.coerce.number().int().positive(),
		HOST: z.string().nonempty(),
		CREATE_GAME: z.string().nonempty(),
		GAME_HISTORY: z.string().nonempty(),
		TOTAL_STATS: z.string().nonempty(),
		HEAD_TO_HEAD: z.string().nonempty(),
		HEALTH_CHECK: z.string().nonempty(),
		DOCUMENTATION: z.string().nonempty(),
		NODE_ENV: z.enum(["development", "production"]),
	})

export const env = envZodSchema.parse({
	PORT: process.env.PONG_DB_PORT,
	HOST: process.env.HOST,
	CREATE_GAME: process.env.PONG_DB_CREATE_GAME_STATIC,
	GAME_HISTORY: process.env.PONG_DB_GAME_HISTORY_STATIC,
	TOTAL_STATS: process.env.PONG_DB_TOTAL_STATS_STATIC,
	HEAD_TO_HEAD: process.env.PONG_DB_HEAD_TO_HEAD_STATIC,
	HEALTH_CHECK: process.env.PONG_DB_HEALTH_CHECK_STATIC,
	DOCUMENTATION: process.env.PONG_DB_DOCUMENTATION_STATIC,
	NODE_ENV: process.env.NODE_ENV,
});