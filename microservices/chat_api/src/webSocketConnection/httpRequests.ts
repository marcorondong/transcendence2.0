import { blockStatusSchema, roomIdSchema, userZodSchema } from "./zodSchemas";
import { env } from "../utils/env";

export async function postRequestCreateUser(userId: string) {
	const response = await fetch(env.CHAT_DB_CREATE_USER_REQUEST_DOCKER, {
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
	const response = await fetch(
		`${env.CHAT_DB_BLOCK_STATUS_REQUEST_DOCKER}/${userId}/${friendId}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
	if (!response.ok) {
		const errorMessage = await response.text();
		throw new Error(
			`BlockStatus Request failed with status ${errorMessage}`,
		);
	}
	const data = await response.json();
	const { blockStatus } = blockStatusSchema.parse(data);
	return blockStatus;
}

export async function getRequestRoomId(userId: string) {
	const response = await fetch(`${env.PONG_API_PLAYER_ROOM_REQUEST_DOCKER}/${userId}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) {
		const errorMessage = await response.text();
		throw new Error(`RoomId Request failed with status ${errorMessage}`);
	}
	const data = await response.json();
	console.log("data ->", data);
	const { roomId } = roomIdSchema.parse(data);
	return roomId;
}

export async function getRequestVerifyConnection(
	cookie: string,
	socket: WebSocket,
) {
	try {
		const response = await fetch(
			env.AUTH_API_VERIFY_CONNECTION_REQUEST_DOCKER,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Cookie": cookie,
				},
			},
		);
		if (!response.ok) {
			socket.close(1008, "Authentication failed");
			const errorMessage = await response.text();
			throw new Error(`Verify request failed: ${errorMessage}`);
		}
		const data = await response.json();
		const { id, nickname } = userZodSchema.parse(data);
		return { id, nickname };
	} catch (error) {
		// socket.close(1008, "Authentication failed. AUTH_API is down");
		throw new Error(`Verify request failed: ${error}`);
	}
}
