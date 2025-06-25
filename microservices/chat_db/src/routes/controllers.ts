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

function handleError(
	reply: FastifyReply,
	error: string,
	statusCode: number,
	message: string,
) {
	reply.log.warn(
		{
			error,
			statusCode,
			message,
		},
		"Error",
	);
	reply.status(statusCode).send({
		statusCode,
		error,
		message,
	});
}

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
	try {
		const isUserInList = await getBlockStatus(userId, friendId);
		if (isUserInList) {
			handleError(reply, "Conflict", 409, `User already blocked`);
			return;
		}
	} catch (error: any) {
		if (error.message.includes("User not found")) {
			handleError(reply, "NotFound", 404, `User ${friendId} not found`);
			return;
		} else throw error;
	}
	await connectUser(userId, friendId);
	reply.status(200).send({ success: true });
}

export async function unblockUserHandler(
	request: FastifyRequest<{ Body: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, friendId } = request.body;
	try {
		const isUserInBlockList = await getBlockStatus(userId, friendId);
		if (!isUserInBlockList) {
			handleError(reply, "Conflict", 409, `User not blocked`);
			return;
		}
	} catch (error: any) {
		if (error.message.includes("User not found")) {
			handleError(reply, "NotFound", 404, `User ${friendId} not found`);
			return;
		} else throw error;
	}
	await disconnectUser(userId, friendId);
	reply.status(200).send({ success: true });
}

export async function toggleBlockHandler(
	request: FastifyRequest<{ Body: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, friendId } = request.body;
	let isUserInBlockList;
	try {
		isUserInBlockList = await getBlockStatus(userId, friendId);
	} catch (error: any) {
		if (error.message.includes("User not found")) {
			handleError(reply, "NotFound", 404, `User ${friendId} not found`);
			return;
		} else throw error;
	}
	if (isUserInBlockList) await disconnectUser(userId, friendId);
	else await connectUser(userId, friendId);
	reply.status(200).send({ success: true });
}

export async function blockStatusHandler(
	request: FastifyRequest<{ Params: IdsInput }>,
	reply: FastifyReply,
) {
	const { userId, friendId } = request.params;
	let blockStatus;
	try {
		blockStatus = await getBlockStatus(userId, friendId);
	} catch (error: any) {
		if (error.message.includes("User not found")) {
			handleError(reply, "NotFound", 404, `User ${friendId} not found`);
			return;
		} else throw error;
	}
	reply.status(200).send({ blockStatus });
}

export async function blockListHandler(
	request: FastifyRequest<{ Params: IdInput }>,
	reply: FastifyReply,
) {
	const { userId } = request.params;
	let blockList;
	try {
		blockList = await ft_blockList(userId);
	} catch (error: any) {
		if (error.message.includes("User not found")) {
			handleError(reply, "NotFound", 404, `User ${userId} not found`);
			return;
		} else throw error;
	}
	reply.status(200).send({ blockList });
}

export async function healthCheckHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	await healthCheck();
	reply.status(200).send({ success: true });
}
