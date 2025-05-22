import {
	messageResponseSchema,
	inviteResponseSchema,
	disconnectedResponseSchema,
	errorResponseSchema,
	onlineUsersResponseSchema,
	newUserResponseSchema,
} from "./zodSchemas";
import type { MessageInput, InviteInput } from "./zodSchemas";
import type { Client } from "../utils/Client";
import { onlineClients } from "./webSocketConnection";
import { getRequestRoomId } from "./httpRequests";
import { checkUser } from "./service";
import { env } from "../utils/env";

export function connectionHandler(
	socket: WebSocket,
	client: Client,
	isOnline: boolean,
) {
	const me = { id: client.getId(), nickname: client.getNickname() };
	const onlineUsers = Array.from(onlineClients.values())
		.filter((person) => person.getId() !== me.id)
		.map((person) => ({
			id: person.getId(),
			nickname: person.getNickname(),
		}));
	const onlineUsersResponse = onlineUsersResponseSchema.parse({
		type: "onlineUsers",
		users: onlineUsers,
		me: me,
	});
	socket.send(JSON.stringify(onlineUsersResponse));
	if (!isOnline) {
		const newUserResponse = newUserResponseSchema.parse({
			type: "newUser",
			user: me,
		});
		onlineClients.forEach((person) => {
			person.send(JSON.stringify(newUserResponse));
		});
		onlineClients.set(me.id, client);
		console.log(`Client ${me.nickname} connected`);
	} else console.log(`Client ${me.nickname} reconnected`);
}

export async function messageHandler(data: MessageInput, client: Client) {
	const { id, message } = data;
	const { friendClient, friendBlockStatus } = await checkUser(id, client);
	const messageResponse = messageResponseSchema.parse({
		type: "message",
		sender: { id: client.getId(), nickname: client.getNickname() },
		receiver: { id: id, nickname: friendClient.getNickname() },
		message: message,
	});
	client.send(JSON.stringify(messageResponse));
	if (!friendBlockStatus) friendClient.send(JSON.stringify(messageResponse));
	console.log(messageResponse);
}

export async function inviteHandler(data: InviteInput, client: Client) {
	const { id } = data;
	const { friendClient, friendBlockStatus } = await checkUser(id, client);
	if (!friendBlockStatus) {
		const roomId = await getRequestRoomId(client.getId());
		const inviteResponse = inviteResponseSchema.parse({
			type: "invite",
			user: { id: client.getId(), nickname: client.getNickname() },
			roomId: roomId,
		});
		friendClient.send(JSON.stringify(inviteResponse));
	}
}

export function disconnectionHandler(client: Client, socket: WebSocket) {
	client.removeSocket(socket);
	if (client.hasActiveSockets()) return;
	const disconnectedResponse = disconnectedResponseSchema.parse({
		type: "disconnected",
		user: { id: client.getId(), nickname: client.getNickname() },
	});
	onlineClients.forEach((person) => {
		if (person.getId() !== client.getId()) {
			person.send(JSON.stringify(disconnectedResponse));
		}
	});
}

export function errorHandler(socket: WebSocket, error: any) {
	let errorMessage = "Something went wrong. Please try again later.";
	if (env.NODE_ENV === "development") {
		// TODO create warning for better frontend information or no need 
		errorMessage = `${error}`;
	}
	const errorResponse = errorResponseSchema.parse({
		type: "error",
		errorMessage: errorMessage,
	});
	socket.send(JSON.stringify(errorResponse)); // TODO right now sending error response to the client's socket where the error occurred
	console.error(error);
}
