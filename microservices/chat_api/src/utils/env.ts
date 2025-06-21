import { z } from "zod";

const envZodSchema = z.object({
	CHAT_API_PORT: z.coerce.number().int().positive(),
	CHAT_API_CONNECTION_STATIC: z.string().nonempty(),
	CHAT_API_HEALTH_CHECK_STATIC: z.string().nonempty(),
	CHAT_DB_CREATE_USER_REQUEST_DOCKER: z.string().nonempty(),
	CHAT_DB_BLOCK_STATUS_REQUEST_DOCKER: z.string().nonempty(),
	AUTH_API_VERIFY_CONNECTION_REQUEST_DOCKER: z.string().nonempty(),
	PONG_API_PLAYER_ROOM_REQUEST_DOCKER: z.string().nonempty(),
	USERS_REQUEST_DOCKER: z.string().nonempty(),
	HOST: z.string().nonempty(),
	NODE_ENV: z.enum(["development", "production"]),
});

export const env = envZodSchema.parse(process.env);
