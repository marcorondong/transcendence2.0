import type { FastifyInstance } from "fastify";
import {
	createGameOpt,
	gameHistoryOpt,
	totalStatsOpt,
	headToHeadOpt,
	healthCheckOpt,
} from "./options";

export async function pongRoutes(server: FastifyInstance) {
	server.post("/create-game", createGameOpt);
	server.get("/game-history/:userId", gameHistoryOpt);
	server.get("/total-stats/:userId", totalStatsOpt);
	server.get("/head-to-head/:userId/:opponentId", headToHeadOpt);
	server.get("/health-check", healthCheckOpt);
}
