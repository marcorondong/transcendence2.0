import { blockStatusSchema, roomIdSchema } from "./zodSchemas";

export async function postRequestCreateUser(userId: string) {
	const url = `http://chat_db_container:3004/chat-db/create-user`;
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ userId }),
	});
	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}
}

export async function getRequestBlockStatus(userId: string, friendId: string) {
	const url = `http://chat_db_container:3004/chat-db/block-status/${userId}/${friendId}`;
	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}
	const data = await response.json();
	const { blockStatus } = blockStatusSchema.parse(data);
	return blockStatus;
}

export async function getRequestRoomId(userId: string) {
	const url = `http://pong-api:3010/playerRoom/${userId}`;
	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}
	const data = await response.json();
	try {
		const { roomId } = roomIdSchema.parse(data); // TODO Filip should fix his endpoint
		return roomId;
	} catch (error) {
		throw new Error(`No roomId found for user ${userId}`);
	}
}
