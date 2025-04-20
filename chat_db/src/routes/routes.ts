import { FastifyInstance } from "fastify";
import { createUserOpt, blockUserOpt, unblockUserOpt, blockStatusOpt, blockListOpt } from "./options";
import { create } from "domain";

export async function chatRoutes(server: FastifyInstance) {
	try {
		server.post("/createUser", createUserOpt);
		server.patch("/blockUser", blockUserOpt);
		server.patch("/unblockUser", unblockUserOpt);
		server.get("/blockStatus/:id/:friendId", blockStatusOpt);
		server.get("/blockList/:id", blockListOpt);
		// server.get("/chatHistory/:id/:friendId", chatHistoryOpt);
	} catch (error) {
		console.error("Error registering chat history routes:", error);
	}
}

