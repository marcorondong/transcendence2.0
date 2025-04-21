import { FastifyReply, FastifyRequest } from "fastify";
import { idZodSchema, idsZodSchema, IdInput, IdsInput } from "./zodSchemas";
import {
	createUser,
	addToBlockList,
	removeFromBlockList,
	getBlockStatus,
	getBlockList,
} from "./service";

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
	await addToBlockList(userId, friendId);
	reply.status(200).send({ message: "User blocked successfully" });
}

export async function unblockUserHandler(
	request: FastifyRequest<{ Body: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, friendId } = idsZodSchema.parse(request.body);
	await removeFromBlockList(userId, friendId);
	reply.status(200).send({ message: "User unblocked successfully" });
}

export async function blockStatusHandler(
	request: FastifyRequest<{ Params: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, friendId } = idsZodSchema.parse(request.params);
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
