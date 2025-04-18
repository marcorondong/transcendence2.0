import { FastifyInstance } from "fastify";
import { gamesOpt, totalOpt, headToHeadOpt } from "./game.options";


export async function gameRoutes(server: FastifyInstance) {
	server.get("/games/:id", gamesOpt);
	server.get("/total/:id", totalOpt);
	server.get("/headToHead/:id/:opponentId", headToHeadOpt);
}

