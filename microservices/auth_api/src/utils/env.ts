import { z } from "zod";

// TODO: Later; is very probable that none of USERS requests will be handled by AUTH.
const envZodSchema = z.object({
	HOST: z.string().nonempty(),
	AUTH_API_PORT: z.coerce.number().int().positive(),
	AUTH_API_SIGN_IN_STATIC: z.string().nonempty(),
	AUTH_API_SIGN_UP_STATIC: z.string().nonempty(),
	AUTH_API_SIGN_OUT_STATIC: z.string().nonempty(),
	AUTH_API_VERIFY_JWT_STATIC: z.string().nonempty(),
	AUTH_API_REFRESH_JWT_STATIC: z.string().nonempty(),
	AUTH_API_VERIFY_CONNECTION_STATIC: z.string().nonempty(),
	AUTH_API_BOT_JWT_STATIC: z.string().nonempty(),
	// AUTH_API_USERS_STATIC: z.string().nonempty(), // AUTH will only handle cookies/jwt management it should intercept calls
	AUTH_API_HEALTH_CHECK_STATIC: z.string().nonempty(),
	AUTH_API_DOCUMENTATION_STATIC: z.string().nonempty(),
	AUTH_API_JWT_SECRET_FILE_LOCATION_CONTAINER: z.string().nonempty(),
	AUTH_API_COOKIE_SECRET_FILE_LOCATION_CONTAINER: z.string().nonempty(),
	USERS_LOGIN_REQUEST_DOCKER: z.string().nonempty(),
	USERS_REGISTRATION_REQUEST_DOCKER: z.string().nonempty(),
	// USERS_REQUEST_DOCKER: z.string().nonempty(), // AUTH will only handle cookies/jwt management it should intercept calls
	BOT_NICKNAME: z.string().nonempty(),
	BOT_UUID: z.string().uuid(),
	JWT_TOKEN_NAME: z.string().nonempty(),
	NODE_ENV: z.enum(["development", "production"]),
});

export const env = envZodSchema.parse(process.env);
