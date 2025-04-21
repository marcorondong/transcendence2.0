import { FastifyInstance } from "fastify";
import {
	createUserOpt,
	blockUserOpt,
	unblockUserOpt,
	blockStatusOpt,
	blockListOpt,
} from "./options";

export async function chatRoutes(server: FastifyInstance) {
	server.post("/createUser", createUserOpt);
	server.patch("/blockUser", blockUserOpt);
	server.patch("/unblockUser", unblockUserOpt);
	server.get("/blockStatus/:id/:friendId", blockStatusOpt);
	server.get("/blockList/:id", blockListOpt);
}
