import {
	messageSchema,
	messageResponseSchema,
	blockSchema,
	blockResponseSchema,
	blockStatusSchema,
	blockStatusResponseSchema,
	inviteSchema,
	inviteResponseSchema,
} from "./zodSchemas";
import type {
	MessageInput,
	BlockInput,
	BlockStatusInput,
	InviteInput,
	TerminateInput,
} from "./zodSchemas";
import type { Client } from "../utils/Client";
import { onlineClients } from "./webSocketConnection";
import {
	patchRequestBlockUser,
	patchRequestUnblockUser,
	getRequestRoomId,
} from "./service";

export function messageHandler(data: MessageInput, client: Client) {
	const { message, relatedId } = messageSchema.parse(data);
	const friendClient = onlineClients.get(relatedId);
	if (!friendClient) throw new Error("Server: related UUID not found");
	if (client.isBlocked(relatedId)) throw new Error("Server: user is blocked");
	const messageResponse = messageResponseSchema.parse({
		type: "messageResponse",
		message: message,
		relatedId: client.getId(),
	});
	client.getSocket().send(JSON.stringify(messageResponse));
	if (!friendClient.isBlocked(client.getId()))
		friendClient.getSocket().send(JSON.stringify(messageResponse));
}

export async function blockHandler(data: BlockInput, client: Client) {
	const { relatedId } = blockSchema.parse(data);
	const friendClient = onlineClients.get(relatedId);
	if (!friendClient) throw new Error("Server: related UUID not found");
	if (client.isBlocked(relatedId)) {
		await patchRequestUnblockUser(client.getId(), relatedId);
		client.removeBlockedUser(relatedId);
	} else {
		await patchRequestBlockUser(client.getId(), relatedId);
		client.addBlockedUser(relatedId);
	}
	const blockResponse = blockResponseSchema.parse({
		type: "blockResponse",
		relatedId: relatedId,
		notification: `Block status changed for user ${relatedId}`, // TODO for debugging purposes
	});
	client.getSocket().send(JSON.stringify(blockResponse));
}

export function blockStatusHandler(data: BlockStatusInput, client: Client) {
	const { relatedId } = blockStatusSchema.parse(data);
	const blockStatus = client.isBlocked(relatedId);
	const blockStatusResponse = blockStatusResponseSchema.parse({
		type: "blockStatusResponse",
		blockStatus: blockStatus,
		relatedId: relatedId,
		notification: `Block status for user ${relatedId}`, // TODO for debugging purposes
	});
	client.getSocket().send(JSON.stringify(blockStatusResponse));
}

export async function inviteHandler(data: InviteInput, client: Client) {
	const { relatedId } = inviteSchema.parse(data);
	const friendClient = onlineClients.get(relatedId);
	if (!friendClient) throw new Error("Server: related UUID not found");
	if (client.isBlocked(relatedId)) throw new Error("Server: user is blocked");
	if (!friendClient.isBlocked(client.getId())) {
		// const roomId = await getRequestRoomId(client.getId());
		const inviteResponse = inviteResponseSchema.parse({
			type: "inviteResponse",
			relatedId: client.getId(),
			roomId: crypto.randomUUID(), // TODO change to roomId from getRequestRoomId
			notification: `${client.getId()} wants to play Ping Pong with you!`, // TODO for debugging purposes
		});
		friendClient.getSocket().send(JSON.stringify(inviteResponse));
	}
}

export function terminateHandler(data: TerminateInput, client: Client) {
	client.getSocket().close();
}
