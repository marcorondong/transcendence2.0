import {
	messageResponseSchema,
	inviteResponseSchema,
	errorResponseSchema,
} from "./zodSchemas";
import type {
	MessageInput,
	InviteInput,
} from "./zodSchemas";
import type { Client } from "../utils/Client";
import { onlineClients } from "./webSocketConnection";
import {
	getRequestBlockStatus,
	getRequestRoomId,
} from "./service";

export async function messageHandler(data: MessageInput, client: Client) {
	const { id, message } = data;
	const currentId = client.getId();
	if (id === currentId) throw new Error("Server: You cannot send a message to yourself");
	const friendClient = onlineClients.get(id);
	if (!friendClient) throw new Error("Server: friend UUID not found");
	const blockStatus = await getRequestBlockStatus(currentId, id);
	if (blockStatus) throw new Error("Server: user is blocked");
	const friendBlockStatus = await getRequestBlockStatus(id, currentId);
	const messageResponse = messageResponseSchema.parse({
		type: "message",
		sender: {
			id: currentId,
			nickname: client.getNickname(),
		},
		receiver: {
			id: id,
			nickname: friendClient.getNickname(),
		},
		message: message,
	});
	console.log(messageResponse);
	client.getSocket().send(JSON.stringify(messageResponse));
	if (!friendBlockStatus)
		friendClient.getSocket().send(JSON.stringify(messageResponse));
}

export async function inviteHandler(data: InviteInput, client: Client) {
	const { id } = data;
	const currentId = client.getId();
	const friendClient = onlineClients.get(id);
	if (!friendClient) throw new Error("Server: friend UUID not found");
	const blockStatus = await getRequestBlockStatus(currentId, id);
	if (blockStatus) throw new Error("Server: user is blocked");
	const friendBlockStatus = await getRequestBlockStatus(id, currentId);
	if (!friendBlockStatus) {
		const roomId = await getRequestRoomId(client.getId());
		const inviteResponse = inviteResponseSchema.parse({
			type: "invite",
			user: {
				id: currentId,
				nickname: client.getNickname(),
			},
			roomId: roomId,
		});
		friendClient.getSocket().send(JSON.stringify(inviteResponse));
	}
}
