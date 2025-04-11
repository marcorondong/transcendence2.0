import { FastifyInstance } from "fastify";
import { chatHistoryOpt } from "./chatHistory.options";

export async function chatHistoryRoutes(server: FastifyInstance) {
	console.log("Registering chat history routes");
	try {
		server.get("/chatHistory/:userName/:friendName", chatHistoryOpt);
	} catch (error) {
		console.error("Error registering chat history routes:", error);
	}
}
