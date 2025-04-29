import type { FastifyInstance } from "fastify";
import {
	createUserOpt,
	blockUserOpt,
	unblockUserOpt,
	blockStatusOpt,
	blockListOpt,
	healthCheckOpt,
} from "./options";

export async function chatRoutes(server: FastifyInstance) {
	server.post("/create-user", createUserOpt);
	server.patch("/block-user", blockUserOpt);
	server.patch("/unblock-user", unblockUserOpt);
	server.get("/block-status/:userId/:friendId", blockStatusOpt);
	server.get("/block-list/:userId", blockListOpt);
	server.get("/health-check", healthCheckOpt);
}
