import type { FastifyRequest } from "fastify";
import type { Client } from "../utils/Client";
import { onlineClients } from "./webSocketConnection";
import { getRequestBlockStatus, getRequestFriends } from "./httpRequests";

export function checkCookie(request: FastifyRequest) {
	const cookie = request.headers.cookie;
	const token = request.cookies.access_token;
	if (!cookie || !token) {
		throw new Error("Missing cookie or access token");
	}
	return cookie;
}

export async function checkUser(id: string, client: Client) {
	const currentId = client.getId();
	if (id === currentId)
		throw new Error("Server: You cannot send a message to yourself");
	const friendClient = onlineClients.get(id);
	if (!friendClient) throw new Error("Server: friend UUID not found");
	const blockStatus = await getRequestBlockStatus(currentId, id);
	if (blockStatus) throw new Error("Server: user is blocked");
	const friendsRaw = await getRequestFriends(currentId);
	const friends = friendsRaw.map((friend: any) => friend.id);
	if (!friends.includes(id)) throw new Error("Server: You are not friends");
	const friendBlockStatus = await getRequestBlockStatus(id, currentId);
	return { friendClient, friendBlockStatus };
}
