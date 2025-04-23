import type { FastifyInstance } from "fastify";
import {
	gameHistoryOpt,
	totalStatsOpt,
	headToHeadOpt,
	createGameOpt,
	deleteIdOpt,
} from "./options";

export async function chatRoutes(server: FastifyInstance) {
	server.get("/game-history/:id", gameHistoryOpt);
	server.get("/total-stats/:id", totalStatsOpt);
	server.get("/head-to-head/:user-id/:opponent-id", headToHeadOpt);
	server.post("/create-game", createGameOpt);
	server.patch("/delete-id", deleteIdOpt);
}
