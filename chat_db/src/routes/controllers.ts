import { FastifyReply, FastifyRequest } from "fastify";
import {
	idZodSchema,
	idsZodSchema,
	// chatHistoryResponseSchema,
	IdInput,
	IdsInput,
} from "./zodSchemas";
import {
	createUser,
	addToBlockList,
	removeFromBlockList,
	getBlockStatus,
	getBlockList,
	// getChatHistory,
} from "../dbUtils";

export async function createUserHandler(
	request: FastifyRequest<{ Body: IdInput }>,
	reply: FastifyReply,
) {
	try {
		const { id } = idZodSchema.parse(request.body);
		const user = await createUser(id);
		reply.status(200).send( user );
	} catch (error) {
		console.error("Error in createUserHandler:", error);
		reply.status(500).send({ error });
	}
}

export async function blockUserHandler(
	request: FastifyRequest<{ Body: IdsInput }>,
	reply: FastifyReply,
) {
	try {
		const { id, friendId } = idsZodSchema.parse(request.body);
		await addToBlockList(id, friendId);
		reply.status(200).send({ message: "User blocked successfully" });
	} catch (error) {
		console.error("Error in blockListHandler:", error);
		reply.status(500).send({ error });
	}
}

export async function unblockUserHandler(
	request: FastifyRequest<{ Body: IdsInput }>,
	reply: FastifyReply,
) {
	try {
		const { id, friendId } = idsZodSchema.parse(request.body);
		await removeFromBlockList(id, friendId);
		reply.status(200).send({ message: "User unblocked successfully" });
	} catch (error) {
		console.error("Error in unblockListHandler:", error);
		reply.status(500).send({ error });
	}
}

export async function blockStatusHandler(
	request: FastifyRequest<{ Params: IdsInput }>,
	reply: FastifyReply,
) {
	try {
		const { id, friendId } = idsZodSchema.parse(request.params);
		const blockStatus = await getBlockStatus(id, friendId);
		reply.status(200).send({ blockStatus });
	} catch (error) {
		console.error("Error in getBlockStatus:", error);
		reply.status(500).send({ error });
	}
}

export async function blockListHandler(
	request: FastifyRequest<{ Params: IdInput }>,
	reply: FastifyReply,
) {
	try {
		const { id } = idZodSchema.parse(request.params);
		const blockList = await getBlockList(id);
		reply.status(200).send({ blockList });
	} catch (error) {
		console.error("Error in getBlockList:", error);
		reply.status(500).send({ error });
	}
}

// export async function chatHistoryHandler(
// 	request: FastifyRequest<{ Params: IdsInput }>,
// 	reply: FastifyReply,
// ) {
// 	try {
// 		const { id, friendId } = idsZodSchema.parse(request.params);
// 		const chatHistory = await getChatHistory(id, friendId);
// 		const blockButton = await getBlockStatus(id, friendId);
// 		reply.status(200).send({
// 			chatHistory,
// 			blockButton,
// 		});
// 	} catch (error) {
// 		console.error("Error in getChatHistory:", error);
// 		reply.status(500).send({ error });
// 		// if (error instanceof z.ZodError) {
// 		// 	reply.status(400).send({
// 		// 		error: "Invalid input",
// 		// 		details: error.errors,
// 		// 	});
// 		// } else if (error instanceof DatabaseError) {
// 		// 	reply.status(500).send({
// 		// 		error: "Database error",
// 		// 		message: error.message,
// 		// 	});
// 		// } else {
// 		// 	reply.status(500).send({
// 		// 		error: "Internal server error",
// 		// 		message: "An unexpected error occurred.",
// 		// 	});
// 		// }
// 	}
// }
