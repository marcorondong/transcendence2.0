import type { FastifyInstance } from "fastify";
import {
	gameHistoryOpt,
	totalStatsOpt,
	headToHeadOpt,
	createGameOpt,
} from "./options";

export async function pongRoutes(server: FastifyInstance) {
	server.post("/create-game", createGameOpt);
	server.get("/game-history/:userId", gameHistoryOpt);
	server.get("/total-stats/:userId", totalStatsOpt);
	server.get("/head-to-head/:userId/:opponentId", headToHeadOpt);
}
