import type { FastifyReply, FastifyRequest } from "fastify";
import { idZodSchema, idsZodSchema, successResponseSchema, blockStatusResponseSchema, blockListResponseSchema } from "./zodSchemas";
import type { IdInput, IdsInput } from "./zodSchemas";
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
	await createUser(userId);
	const successResponse = successResponseSchema.parse({ success: true} );
	reply.status(201).send(successResponse);
}

export async function blockUserHandler(
	request: FastifyRequest<{ Body: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, friendId } = idsZodSchema.parse(request.body);
	await addToBlockList(userId, friendId);
	const successResponse = successResponseSchema.parse({ success: true });
	reply.status(200).send(successResponse);
}

export async function unblockUserHandler(
	request: FastifyRequest<{ Body: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, friendId } = idsZodSchema.parse(request.body);
	await removeFromBlockList(userId, friendId);
	const successResponse = successResponseSchema.parse({ success: true});
	reply.status(200).send(successResponse);
}

export async function blockStatusHandler(
	request: FastifyRequest<{ Params: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, friendId } = idsZodSchema.parse(request.params);
	const blockStatus = await getBlockStatus(userId, friendId);
	const blockStatusResponse = blockStatusResponseSchema.parse( { blockStatus } );
	reply.status(200).send(blockStatusResponse);
}

export async function blockListHandler(
	request: FastifyRequest<{ Params: IdInput }>,
	reply: FastifyReply,
) {
	const { userId } = idZodSchema.parse(request.params);
	const blockList = await getBlockList(userId);
	const blockListResponse = blockListResponseSchema.parse({ blockList });
	reply.status(200).send({ blockListResponse });
}

export async function healthCheckHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const healthCheckResponse = successResponseSchema.parse({ success: true });
	reply.status(200).send(healthCheckResponse);
}
