import type { FastifyInstance } from "fastify";
import {
	signInOpt,
	signUpOpt,
	signOutOpt,
	verifyJWTOpt,
	refreshJWTOpt,
	botJWTOpt,
	verifyConnectionOpt,
	// editProfileOpt, // AUTH will only handle cookies/jwt management it should intercept calls
	// updateProfileOpt, // AUTH will only handle cookies/jwt management it should intercept calls
	// deleteUserOpt, // AUTH will only handle cookies/jwt management it should intercept calls
	healthCheckOpt,
} from "./options";
import { env } from "../utils/env";

export async function authRoutes(server: FastifyInstance) {
	server.post(env.AUTH_API_SIGN_IN_STATIC, signInOpt);
	server.post(env.AUTH_API_SIGN_UP_STATIC, signUpOpt);
	server.delete(env.AUTH_API_SIGN_OUT_STATIC, signOutOpt);
	server.get(env.AUTH_API_VERIFY_JWT_STATIC, verifyJWTOpt);
	server.get(env.AUTH_API_REFRESH_JWT_STATIC, refreshJWTOpt);
	server.get(env.AUTH_API_BOT_JWT_STATIC, botJWTOpt);
	server.get(env.AUTH_API_VERIFY_CONNECTION_STATIC, verifyConnectionOpt);
	// server.patch(env.AUTH_API_USERS_STATIC, editProfileOpt); // AUTH will only handle cookies/jwt management it should intercept calls
	// server.put(env.AUTH_API_USERS_STATIC, updateProfileOpt); // AUTH will only handle cookies/jwt management it should intercept calls
	// server.delete(env.AUTH_API_USERS_STATIC, deleteUserOpt); // AUTH will only handle cookies/jwt management it should intercept calls
	server.get(env.AUTH_API_HEALTH_CHECK_STATIC, healthCheckOpt);
}
