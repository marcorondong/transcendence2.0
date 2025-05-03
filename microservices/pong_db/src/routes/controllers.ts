import type { FastifyReply, FastifyRequest } from "fastify";
import type { IdInput, IdsInput, GameInput } from "./zodSchemas";
import httpError from "http-errors";
import {
	createGame,
	getGameHistory,
	getTotalStats,
	getHeadToHeadStats,
} from "./service";

export async function createGameHandler(
	request: FastifyRequest<{ Body: GameInput }>,
	reply: FastifyReply,
) {
	const { winnerId, loserId, winnerScore, loserScore, gameId } = request.body;
	if (winnerId === loserId)
		throw new httpError.BadRequest("winnerId and loserId cannot be the same");
	if (winnerScore <= loserScore)
		throw new httpError.BadRequest("winnerScore must be greater than loserScore");
	await createGame(winnerId, loserId, winnerScore, loserScore, gameId );
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
	if (userId === opponentId)
		throw new httpError.BadRequest(
			"userId and opponentId cannot be the same",
		);
	const stats = await getHeadToHeadStats(userId, opponentId);
	reply.status(200).send(stats);
}

export async function healthCheckHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.status(200).send({ success: true });
}
