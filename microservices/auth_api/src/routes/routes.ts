import type { FastifyInstance } from "fastify";
import {
	signInOpt,
	signOutOpt,
	verifyJWTOpt,
	healthCheckOpt,
} from "./options";

export async function authRoutes(server: FastifyInstance) {

	server.post("/auth-api/sign-in", signInOpt);
	server.delete("/auth-api/sign-out", signOutOpt);
	server.get("/auth-api/verify-jwt", verifyJWTOpt);
	server.get("/auth-api/health-check", healthCheckOpt);
}
