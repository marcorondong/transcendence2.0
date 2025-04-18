import { FastifyInstance } from "fastify";
import { gamesOpt, totalStatsOpt, headToHeadOpt } from "./options";


export async function gameRoutes(server: FastifyInstance) {
	server.get("/games/:id", gamesOpt);
	server.get("/totalStats/:id", totalStatsOpt);
	server.get("/headToHead/:id/:opponentId", headToHeadOpt);
}

