import { blockStatusSchema, roomIdSchema, userZodSchema } from "./zodSchemas";

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
		const errorMessage = await response.text();
		throw new Error(`Request failed with status ${errorMessage}`);
	}
	const data = await response.json();
	const { blockStatus } = blockStatusSchema.parse(data);
	return blockStatus;
}

export async function getRequestRoomId(userId: string) {
	const url = `http://pong-api:3010/pong-api/player-room/${userId}`;
	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) {
		const errorMessage = await response.text();
		throw new Error(`Request failed with status ${errorMessage}`);
	}
	const data = await response.json();
	const { roomId } = roomIdSchema.parse(data);
	return roomId;
}

export async function getRequestVerifyConnection(
	cookie: string,
	socket: WebSocket,
) {
	const url = `http://auth_api_container:2999/auth-api/verify-connection`;
	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Cookie": cookie,
		},
	});
	if (!response.ok) {
		socket.close(1008, "Authentication failed");
		const errorMessage = await response.text();
		throw new Error(`Verify request failed: ${errorMessage}`);
	}
	const data = await response.json();
	const { id, nickname} = userZodSchema.parse(data);
	return { id, nickname };
}
