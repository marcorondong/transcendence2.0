import type { FastifyInstance } from "fastify";
import {
	createGameOpt,
	gameHistoryOpt,
	userStatsOpt,
	usersStatsOpt,
	headToHeadOpt,
	healthCheckOpt,
} from "./options";
import { env } from "../utils/env";

export async function pongRoutes(server: FastifyInstance) {
	server.post(env.PONG_DB_CREATE_GAME_STATIC, createGameOpt);
	server.get(env.PONG_DB_GAME_HISTORY_STATIC, gameHistoryOpt);
	server.get(env.PONG_DB_USER_STATS_STATIC, userStatsOpt);
	server.post(env.PONG_DB_USERS_STATS_STATIC, usersStatsOpt);
	server.get(env.PONG_DB_HEAD_TO_HEAD_STATIC, headToHeadOpt);
	server.get(env.PONG_DB_HEALTH_CHECK_STATIC, healthCheckOpt);
}
