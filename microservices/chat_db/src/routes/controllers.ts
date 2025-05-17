import type { FastifyReply, FastifyRequest } from "fastify";
import type { IdInput, IdsInput } from "./zodSchemas";
import {
	createUser,
	isUserExists,
	getBlockStatus,
	ft_blockList,
	connectUser,
	disconnectUser,
	healthCheck,
} from "./service";
import httpError from "http-errors";

export async function createUserHandler(
	request: FastifyRequest<{ Body: IdInput }>,
	reply: FastifyReply,
) {
	const { userId } = request.body;
	const existingUser = await isUserExists(userId);
	if (!existingUser) await createUser(userId);
	reply.status(201).send({ success: true });
}

export async function blockUserHandler(
	request: FastifyRequest<{ Body: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, friendId } = request.body;
	const isUserInList = await getBlockStatus(userId, friendId);
	if (isUserInList) throw new httpError.Conflict("User already blocked");
	await connectUser(userId, friendId);
	reply.status(200).send({ success: true });
}

export async function unblockUserHandler(
	request: FastifyRequest<{ Body: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, friendId } = request.body;
	const isUserInBlockList = await getBlockStatus(userId, friendId);
	if (!isUserInBlockList) throw new httpError.Conflict("User not blocked");
	await disconnectUser(userId, friendId);
	reply.status(200).send({ success: true });
}

export async function toggleBlockHandler(
	request: FastifyRequest<{ Body: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, friendId } = request.body;
	const isUserInBlockList = await getBlockStatus(userId, friendId);
	if (isUserInBlockList) await disconnectUser(userId, friendId);
	else await connectUser(userId, friendId);
	reply.status(200).send({ success: true });
}

export async function blockStatusHandler(
	request: FastifyRequest<{ Params: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, friendId } = request.params;
	const blockStatus = await getBlockStatus(userId, friendId);
	reply.status(200).send({ blockStatus });
}

export async function blockListHandler(
	request: FastifyRequest<{ Params: IdInput }>,
	reply: FastifyReply,
) {
	const { userId } = request.params;
	const blockList = await ft_blockList(userId);
	reply.status(200).send({ blockList });
}

export async function healthCheckHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	await healthCheck();
	reply.status(200).send({ success: true });
}
