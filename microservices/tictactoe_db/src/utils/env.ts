import { z } from "zod";

const envZodSchema = z.object({
	TICTACTOE_DB_PORT: z.coerce.number().int().positive(),
	HOST: z.string().nonempty(),
	TICTACTOE_DB_CREATE_GAME_STATIC: z.string().nonempty(),
	TICTACTOE_DB_GAME_HISTORY_STATIC: z.string().nonempty(),
	TICTACTOE_DB_TOTAL_STATS_STATIC: z.string().nonempty(),
	TICTACTOE_DB_HEAD_TO_HEAD_STATIC: z.string().nonempty(),
	TICTACTOE_DB_HEALTH_CHECK_STATIC: z.string().nonempty(),
	TICTACTOE_DB_DOCUMENTATION_STATIC: z.string().nonempty(),
	NODE_ENV: z.enum(["development", "production"]),
});

export const env = envZodSchema.parse(process.env);
