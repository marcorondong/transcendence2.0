import { z } from "zod";

const envZodSchema = z.object({
	TICTACTOE_API_PORT: z.coerce.number().int().positive(),
	TICTACTOE_API_CONNECTION_STATIC: z.string().nonempty(),
	TICTACTOE_API_HEALTH_CHECK_STATIC: z.string().nonempty(),
	TICTACTOE_DB_CREATE_GAME_REQUEST_DOCKER: z.string().nonempty(),
	TICTACTOE_DB_HEAD_TO_HEAD_REQUEST_DOCKER: z.string().nonempty(),
	AUTH_API_VERIFY_CONNECTION_REQUEST_DOCKER: z.string().nonempty(),
	HOST: z.string().nonempty(),
	NODE_ENV: z.enum(["development", "production"]),
});

export const env = envZodSchema.parse(process.env);
