import type { FastifyReply, FastifyRequest } from "fastify";
import type { IdInput, IdsInput } from "./zodSchemas";
import {
	createOrGetUser,
	addToBlockList,
	removeFromBlockList,
	toggleBlock,
	getBlockStatus,
	getBlockList,
} from "./service";
import { healthCheck } from "./dbUtils";

export async function createUserHandler(
	request: FastifyRequest<{ Body: IdInput }>,
	reply: FastifyReply,
) {
	const { userId } = request.body;
	const user = await createOrGetUser(userId);
	reply.status(201).send(user);
}

export async function blockUserHandler(
	request: FastifyRequest<{ Body: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, friendId } = request.body;
	await addToBlockList(userId, friendId);
	reply.status(200).send({ success: true });
}

export async function unblockUserHandler(
	request: FastifyRequest<{ Body: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, friendId } = request.body;
	await removeFromBlockList(userId, friendId);
	reply.status(200).send({ success: true });
}

export async function toggleBlockHandler(
	request: FastifyRequest<{ Body: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, friendId } = request.body;
	await toggleBlock(userId, friendId);
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
	const blockList = await getBlockList(userId);
	reply.status(200).send({ blockList });
}

export async function healthCheckHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	await healthCheck();
	reply.status(200).send({ success: true });
}
