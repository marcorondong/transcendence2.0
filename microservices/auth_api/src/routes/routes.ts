import type { FastifyInstance } from "fastify";
import {
	signInOpt,
	signOutOpt,
	healthCheckOpt,
} from "./options";

export async function authRoutes(server: FastifyInstance) {

	server.post("/sign-in", signInOpt);
	server.delete("/sign-out", signOutOpt);
	server.get("/health-check", healthCheckOpt);
	server.get("/test", async (request, reply) => {
		return reply.send({ success: true });
	});
}
