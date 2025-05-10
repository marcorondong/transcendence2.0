import type { FastifyInstance } from "fastify";
import {
	createGameOpt,
	gameHistoryOpt,
	totalStatsOpt,
	headToHeadOpt,
	healthCheckOpt,
} from "./options";
import { env } from "../utils/env";

export async function pongRoutes(server: FastifyInstance) {
	server.post(env.CREATE_GAME, createGameOpt);
	server.get(env.GAME_HISTORY, gameHistoryOpt);
	server.get(env.TOTAL_STATS, totalStatsOpt);
	server.get(env.HEAD_TO_HEAD, headToHeadOpt);
	server.get(env.HEALTH_CHECK, healthCheckOpt);
}
