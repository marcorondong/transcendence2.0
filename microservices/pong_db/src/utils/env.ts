import { z } from "zod";

const envZodSchema = z.object({
	PONG_DB_PORT: z.coerce.number().int().positive(),
	HOST: z.string().nonempty(),
	PONG_DB_CREATE_GAME_STATIC: z.string().nonempty(),
	PONG_DB_GAME_HISTORY_STATIC: z.string().nonempty(),
	PONG_DB_USER_STATS_STATIC: z.string().nonempty(),
	PONG_DB_USERS_STATS_STATIC: z.string().nonempty(),
	PONG_DB_HEAD_TO_HEAD_STATIC: z.string().nonempty(),
	PONG_DB_HEALTH_CHECK_STATIC: z.string().nonempty(),
	PONG_DB_DOCUMENTATION_STATIC: z.string().nonempty(),
	NODE_ENV: z.enum(["development", "production"]),
});

export const env = envZodSchema.parse(process.env);
