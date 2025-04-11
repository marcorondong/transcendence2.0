import { FastifyInstance } from "fastify";
import { friendRequestOpt, gameRequestOpt } from "./request.options";

export async function requestRoutes(server: FastifyInstance) {
	console.log("Registering request routes");
	try {
		server.post("/friendRequest", friendRequestOpt);
		server.post("/gameRequest", gameRequestOpt);
	} catch (error) {
		console.error("Error registering friend list routes:", error);
	}
}
