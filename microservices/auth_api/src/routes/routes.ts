import type { FastifyInstance } from "fastify";
import {
	signInOpt,
	signOutOpt,
	verifyJWTOpt,
	refreshJWTOpt,
	verifyConnectionOpt,
	healthCheckOpt,
} from "./options";
import { env } from "../utils/env";

export async function authRoutes(server: FastifyInstance) {
	server.post(env.AUTH_API_SIGN_IN_STATIC, signInOpt);
	server.delete(env.AUTH_API_SIGN_OUT_STATIC, signOutOpt);
	server.get(env.AUTH_API_VERIFY_JWT_STATIC, verifyJWTOpt);
	server.get(env.AUTH_API_REFRESH_JWT_STATIC, refreshJWTOpt);
	server.get(env.AUTH_API_VERIFY_CONNECTION_STATIC, verifyConnectionOpt);
	server.get(env.AUTH_API_HEALTH_CHECK_STATIC, healthCheckOpt);
}
