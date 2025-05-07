import type { FastifyInstance } from "fastify";
import {
	signInOpt,
	signOutOpt,
	verifyJWTOpt,
	healthCheckOpt,
} from "./options";

export async function authRoutes(server: FastifyInstance) {

	server.post("/sign-in", signInOpt);
	server.delete("/sign-out", signOutOpt);
	server.get("/verify-jwt", verifyJWTOpt);
	server.get("/health-check", healthCheckOpt);
}
