import { FastifyReply, FastifyRequest } from "fastify";
import { findChatHistoryInDB } from "../../utils/dbUtils";
import { m } from "../../config/msgs";
import {
	chatHistoryZodSchema,
	chatHistoryResponseZodSchema,
	ChatHistoryInput,
} from "./chatHistory.zodSchemas";
import { liveClients } from "../../index";
import { Message } from "../../Message";

export async function provideChatHistory(
	request: FastifyRequest<{ Params: ChatHistoryInput }>,
	reply: FastifyReply,
): Promise<void> {
	try {
		const { userName, friendName } = chatHistoryZodSchema.parse(
			request.params,
		);
		const client = liveClients.get(userName);
		if (client) {
			if (!client.isUserFriend(friendName)) {
				return reply.status(400).send({ message: m.notFriends });
			}
			const chatHistory = client.getChatHistoryForUser(friendName);
			if (chatHistory) {
				return reply.status(200).send(
					JSON.stringify({
						chatHistory: chatHistory,
						blockButton: client.isUserBlocked(friendName),
					}),
				);
			} else {
				const chatHistoryFromDB = await findChatHistoryInDB(
					userName,
					friendName,
				);
				const messages = chatHistoryFromDB.map(
					(message) => new Message(message.message, message.sender),
				);
				client.getChatHistory().set(friendName, messages);
				return reply.status(200).send(
					JSON.stringify({
						chatHistory: chatHistoryFromDB,
						blockButton: client.isUserBlocked(friendName),
					}),
				);
			}
		} else {
			return reply.status(404).send({ message: m.notInitialized });
		}
	} catch (error) {
		console.error("Error in getChatHistory:", error);
		return reply.status(500).send({ error });
	}
}
