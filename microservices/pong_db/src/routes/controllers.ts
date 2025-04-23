import type { FastifyReply, FastifyRequest } from "fastify";
import {
	idZodSchema,
	idsZodSchema,
	gameHistoryResponseSchema,
	statsResponseSchema,
	successResponseSchema,
} from "./zodSchemas";
import type { IdInput, IdsInput } from "./zodSchemas";
import {
	getGameHistory,
	getTotalStats,
	getHeadToHeadStats,
	createGame,
	deleteId,
} from "./service";

export async function gameHistoryHandler(
	request: FastifyRequest<{ Params: IdInput }>,
	reply: FastifyReply,
) {
	const { userId } = idZodSchema.parse(request.params);
	const gameHistory = await getGameHistory(userId);
	const gameHistoryResponse = gameHistoryResponseSchema.parse(gameHistory);
	reply.status(200).send({ gameHistoryResponse });
}

export async function totalStatsHandler(
	request: FastifyRequest<{ Params: IdInput }>,
	reply: FastifyReply,
) {
	const { userId } = idZodSchema.parse(request.params);
	const stats = await getTotalStats(userId);
	const statsResponse = statsResponseSchema.parse(stats);
	reply.status(200).send({ statsResponse });
}

export async function headToHeadHandler(
	request: FastifyRequest<{ Params: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, opponentId } = idsZodSchema.parse(request.params);
	const stats = await getHeadToHeadStats(userId, opponentId);
	const statsResponse = statsResponseSchema.parse(stats);
	reply.status(200).send({ statsResponse });
}

export async function createGameHandler(
	request: FastifyRequest<{ Body: IdsInput }>,
	reply: FastifyReply,
) {
	const { winnerId, loserId } = idsZodSchema.parse(request.body);
	await createGame(winnerId, loserId);
	const successResponse = successResponseSchema.parse({ success: true });
	reply.status(201).send(successResponse);
}

export async function deleteIdHandler(
	request: FastifyRequest<{ Body: IdInput }>,
	reply: FastifyReply,
) {
	const { userId } = idZodSchema.parse(request.body);
	await deleteId(userId);
	const successResponse = successResponseSchema.parse({ success: true });
	reply.status(200).send(successResponse);
}
