import type { FastifyReply, FastifyRequest } from "fastify";
import type { IdInput, IdsInput, UserIdsInput, GameInput } from "./zodSchemas";
import {
	createGame,
	getGameHistory,
	getUserStats,
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
	if (!gameHistory || gameHistory.length === 0) {
		reply.log.warn(`No game history found for userId: ${userId}`);
		return reply.status(404).send({
			statusCode: 404,
			error: "NotFound",
			message: "No game history found for this user.",
		});
	}
	reply.status(200).send(gameHistory);
}

export async function userStatsHandler(
	request: FastifyRequest<{ Params: IdInput }>,
	reply: FastifyReply,
) {
	const { userId } = request.params;
	const userStats = await getUserStats(userId);
	if (!userStats) {
		reply.log.warn(`User stats not found for userId: ${userId}`);
		return reply.status(404).send({
			statusCode: 404,
			error: "NotFound",
			message: "User stats not found",
		});
	}
	reply.status(200).send(userStats);
}

export async function usersStatsHandler(
	request: FastifyRequest<{ Body: UserIdsInput }>,
	reply: FastifyReply,
) {
	const { userIds } = request.body;
	const usersStats = await Promise.all(
		userIds.map(async (userId) => {
			const stats = await getUserStats(userId);
			if (!stats) return null;
			return { userId, ...stats };
		}),
	);
	const filteredUsersStats = usersStats.filter((stats) => stats !== null);
	reply.status(200).send(filteredUsersStats);
}

export async function headToHeadHandler(
	request: FastifyRequest<{ Params: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, opponentId } = request.params;
	const stats = await getHeadToHeadStats(userId, opponentId);
	if (!stats) {
		reply.log.warn(
			`Head-to-head stats not found for userId: ${userId} and opponentId: ${opponentId}`,
		);
		return reply.status(404).send({
			statusCode: 404,
			error: "NotFound",
			message: "Head-to-head stats not found",
		});
	}
	reply.status(200).send(stats);
}

export async function healthCheckHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	await healthCheck();
	reply.status(200).send({ success: true });
}
