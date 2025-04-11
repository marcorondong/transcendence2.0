import {
	wsZodParamSchema,
	wsZodMessageSchema,
	wsMessageInput,
} from "./ws.schemas";
import { FastifyInstance } from "fastify";
import { FastifyReply, FastifyRequest } from "fastify";
import { liveClients } from "../../index";
import { WebSocket } from "@fastify/websocket";
import { Client } from "../../Client";
import {
	checkBlockStatusInDB,
	addMessageToDatabase,
} from "../../utils/dbUtils";
import { Message } from "../../Message";

function parseJsonMessage(message: Buffer, socket: WebSocket | null) {
	let data;
	try {
		return JSON.parse(message.toString());
	} catch (error) {
		console.error("Hey Error:", error);
		return null;
	}
}

async function messageHandler(
	message: string,
	sender: string,
	receiver: string,
	client: Client,
) {
	const isFriend = client.isUserFriend(receiver);
	const isInBlockList = client.isUserBlocked(receiver);
	const socket = client.getSocket();
	if (!socket) {
		console.log("Socket not found");
		return;
	}
	if (isInBlockList) {
		socket.send(
			JSON.stringify({
				message:
					"You have blocked this user. You can not send message to this user",
			}),
		);
		return;
	}
	if (!isFriend) {
		client.getSocket()?.send(
			JSON.stringify({
				message: "You are not friends with this user",
			}),
		);
		return;
	}
	let isClientBlocked = false;
	const receiverClient = liveClients.get(receiver);

	if (receiverClient) {
		isClientBlocked = receiverClient.isUserBlocked(sender);
	} else {
		isClientBlocked = await checkBlockStatusInDB(receiver, sender);
	}

	addMessageToDatabase(sender, receiver, message, isClientBlocked);
	client.addToChatHistory(receiver, new Message(message, sender));
	socket.send(JSON.stringify({ message: message, sender: sender }));
	if (receiverClient && !isClientBlocked) {
		receiverClient.addToChatHistory(sender, new Message(message, sender));
		receiverClient
			.getSocket()
			?.send(JSON.stringify({ message: message, sender: sender }));
	}
}

export async function onClientMessage(
	message: string,
	client: Client,
): Promise<void> {
	try {
		const dataConvert = parseJsonMessage(
			Buffer.from(message),
			client.getSocket(),
		);
		console.log("Received message:", message);
		const data = wsZodMessageSchema.parse(dataConvert);
		console.log("Parsed message data:", data);
		const userName = client.getUserName();
		if (data.sender === userName && data.receiver !== userName) {
			messageHandler(data.message, data.sender, data.receiver, client);
		} else {
			client
				.getSocket()
				?.send(JSON.stringify({ message: "Something went wrong" }));
		}
		console.log(`Received message from ${userName}: ${message}`);
	} catch (error) {
		console.error("Error in onClientMessage:");
		client
			.getSocket()
			?.send(JSON.stringify({ message: "Invalid message format" }));
	}
}

export function onClientDisconnect(
	code: number,
	reason: Buffer,
	client: Client,
): void {
	// #TODO should I remove the client from memory?
	try {
		const userName = client.getUserName();

		if (!liveClients.has(userName)) {
			console.log("Warning: Client not found in live clients");
		} else {
			liveClients.delete(userName);
			console.log("Client removed from memory:", userName);
		}
		console.log(
			`Client disconnected: ${userName}, Code: ${code}, Reason: ${reason.toString()}`,
		);
	} catch (error) {
		console.error("Error removing client from memory:", error);
	}
}
