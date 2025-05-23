import { z } from "zod";

const envZodSchema = z.object({
	CHAT_DB_PORT: z.coerce.number().int().positive(),
	HOST: z.string().nonempty(),
	CHAT_DB_CREATE_USER_STATIC: z.string().nonempty(),
	CHAT_DB_BLOCK_USER_STATIC: z.string().nonempty(),
	CHAT_DB_UNBLOCK_USER_STATIC: z.string().nonempty(),
	CHAT_DB_TOGGLE_BLOCK_STATIC: z.string().nonempty(),
	CHAT_DB_BLOCK_STATUS_STATIC: z.string().nonempty(),
	CHAT_DB_BLOCK_LIST_STATIC: z.string().nonempty(),
	CHAT_DB_HEALTH_CHECK_STATIC: z.string().nonempty(),
	CHAT_DB_DOCUMENTATION_STATIC: z.string().nonempty(),
	NODE_ENV: z.enum(["development", "production"]),
});

export const env = envZodSchema.parse(process.env);
