import type { FastifyReply, FastifyRequest } from "fastify";
import { idZodSchema, idsZodSchema } from "./zodSchemas";
import type { IdInput, IdsInput } from "./zodSchemas";
import {
	createUser,
	addToBlockList,
	removeFromBlockList,
	getBlockStatus,
	getBlockList,
} from "./service";
import httpError from "http-errors";

export async function createUserHandler(
	request: FastifyRequest<{ Body: IdInput }>,
	reply: FastifyReply,
) {
	const { userId } = idZodSchema.parse(request.body);
	const user = await createUser(userId);
	reply.status(201).send(user);
}

export async function blockUserHandler(
	request: FastifyRequest<{ Body: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, friendId } = idsZodSchema.parse(request.body);
	if (userId === friendId)
		throw new httpError.BadRequest("userId and friendId cannot be the same");
	await addToBlockList(userId, friendId);
	reply.status(200).send({ success: true });
}

export async function unblockUserHandler(
	request: FastifyRequest<{ Body: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, friendId } = idsZodSchema.parse(request.body);
	if (userId === friendId)
		throw new httpError.BadRequest("userId and friendId cannot be the same");
	await removeFromBlockList(userId, friendId);
	reply.status(200).send({ success: true });
}

export async function blockStatusHandler(
	request: FastifyRequest<{ Params: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, friendId } = idsZodSchema.parse(request.params);
	if (userId === friendId)
		throw new httpError.BadRequest("userId and friendId cannot be the same");
	const blockStatus = await getBlockStatus(userId, friendId);
	reply.status(200).send({ blockStatus });
}

export async function blockListHandler(
	request: FastifyRequest<{ Params: IdInput }>,
	reply: FastifyReply,
) {
	const { userId } = idZodSchema.parse(request.params);
	const blockList = await getBlockList(userId);
	reply.status(200).send({ blockList });
}

export async function healthCheckHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.status(200).send({ success: true });
}
