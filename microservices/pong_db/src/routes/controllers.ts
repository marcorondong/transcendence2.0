import type { FastifyReply, FastifyRequest } from "fastify";
import type { IdInput, IdsInput, GameInput } from "./zodSchemas";
import {
	createGame,
	getGameHistory,
	getTotalStats,
	getHeadToHeadStats,
	healthCheck,
} from "./service";

export async function createGameHandler(
	request: FastifyRequest<{ Body: GameInput }>,
	reply: FastifyReply,
) {
	const game = request.body;
	await createGame(game);
	reply.status(201).send({ success: true });
}

export async function gameHistoryHandler(
	request: FastifyRequest<{ Params: IdInput }>,
	reply: FastifyReply,
) {
	const { userId } = request.params;
	const gameHistory = await getGameHistory(userId);
	reply.status(200).send(gameHistory);
}

export async function totalStatsHandler(
	request: FastifyRequest<{ Params: IdInput }>,
	reply: FastifyReply,
) {
	const { userId } = request.params;
	const totalStats = await getTotalStats(userId);
	reply.status(200).send(totalStats);
}

export async function headToHeadHandler(
	request: FastifyRequest<{ Params: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, opponentId } = request.params;
	const stats = await getHeadToHeadStats(userId, opponentId);
	reply.status(200).send(stats);
}

export async function healthCheckHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	await healthCheck();
	reply.status(200).send({ success: true });
}
