import { FastifyInstance } from "fastify";
import {
	gamesOpt,
	totalStatsOpt,
	headToHeadOpt,
	createGameOpt,
} from "./options";

export async function gameRoutes(server: FastifyInstance) {
	try {
		server.get("/games/:id", gamesOpt);
		server.get("/totalStats/:id", totalStatsOpt);
		server.get("/headToHead/:id/:opponentId", headToHeadOpt);
		server.post("/createGame", createGameOpt);
	} catch (error) {
		console.error("Error registering routes:", error);
	}
}
