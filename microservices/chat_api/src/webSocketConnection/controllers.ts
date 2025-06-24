import {
	messageResponseSchema,
	inviteResponseSchema,
	disconnectedResponseSchema,
	errorResponseSchema,
	onlineUsersResponseSchema,
	newUserResponseSchema,
	updateNicknameResponseSchema,
} from "./zodSchemas";
import type {
	MessageInput,
	InviteInput,
	refreshFriendListInput,
} from "./zodSchemas";
import type { Client } from "../utils/Client";
import { onlineClients } from "./webSocketConnection";
import { getRequestRoomId, getRequestUser } from "./httpRequests";
import { checkUser } from "./service";
import { env } from "../utils/env";
import { getRequestFriends } from "./httpRequests";

export async function connectionHandler(
	socket: WebSocket,
	client: Client,
	isOnline: boolean,
) {
	const me = { id: client.getId(), nickname: client.getNickname() };
	const friendsRaw = await getRequestFriends(me.id);
	const friends = friendsRaw.map((friend: any) => friend.id);
	const onlineUsers = Array.from(onlineClients.values())
		.filter(
			(person) =>
				person.getId() !== me.id && friends.includes(person.getId()),
		)
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
			if (friends.includes(person.getId()))
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

export async function updateNicknameHandler(client: Client) {
	const id = client.getId();
	const response = await getRequestUser(id);
	const rawData = await response.json();
	if (!response.ok)
		throw new Error(`Update nickname request failed: ${rawData}`);
	const updatedUser = { id: rawData.id, nickname: rawData.nickname };
	if (updatedUser.id !== id)
		throw new Error("Update nickname request failed: user ID mismatch");
	client.setNickname(updatedUser.nickname);
	const updateNicknameResponse = updateNicknameResponseSchema.parse({
		type: "updateNickname",
		user: updatedUser,
	});
	onlineClients.forEach((person) => {
		person.send(JSON.stringify(updateNicknameResponse));
	});
}

export async function disconnectionHandler(client: Client, socket: WebSocket) {
	client.removeSocket(socket);
	if (client.hasActiveSockets()) return;
	const friendsRaw = await getRequestFriends(client.getId());
	const friends = friendsRaw.map((friend: any) => friend.id);
	const disconnectedResponse = disconnectedResponseSchema.parse({
		type: "disconnected",
		user: { id: client.getId(), nickname: client.getNickname() },
	});
	onlineClients.forEach((person) => {
		if (
			person.getId() !== client.getId() &&
			friends.includes(person.getId())
		) {
			person.send(JSON.stringify(disconnectedResponse));
		}
	});
}

export function errorHandler(socket: WebSocket, error: any) {
	let errorMessage = "Something went wrong. Please try again later.";
	if (env.NODE_ENV === "development") {
		errorMessage = `${error}`;
	}
	const errorResponse = errorResponseSchema.parse({
		type: "error",
		errorMessage: errorMessage,
	});
	socket.send(JSON.stringify(errorResponse));
	console.error(error);
}

export async function refreshFriendListHandler(
	data: refreshFriendListInput,
	client: Client,
) {
	const id = client.getId();
	const friendsMeRaw = await getRequestFriends(id);
	const friendsMe = friendsMeRaw.map((friend: any) => friend.id);
	const onlineUsersMe = Array.from(onlineClients.values())
		.filter(
			(person) =>
				person.getId() !== id && friendsMe.includes(person.getId()),
		)
		.map((person) => ({
			id: person.getId(),
			nickname: person.getNickname(),
		}));

	const onlineUsersResponseMe = onlineUsersResponseSchema.parse({
		type: "onlineUsers",
		users: onlineUsersMe,
		me: { id: id, nickname: client.getNickname() },
	});
	client.send(JSON.stringify(onlineUsersResponseMe));

	const friendId = data.id;
	const friendClient = onlineClients.get(friendId);
	if (friendClient) {
		const friendsFriendRaw = await getRequestFriends(friendId);
		const friendsFriend = friendsFriendRaw.map((friend: any) => friend.id);

		const onlineUsersFriend = Array.from(onlineClients.values())
			.filter(
				(person) =>
					person.getId() !== friendId &&
					friendsFriend.includes(person.getId()),
			)
			.map((person) => ({
				id: person.getId(),
				nickname: person.getNickname(),
			}));

		const onlineUsersResponseFriend = onlineUsersResponseSchema.parse({
			type: "onlineUsers",
			users: onlineUsersFriend,
			me: { id: friendId, nickname: friendClient?.getNickname() || "" },
		});
		friendClient.send(JSON.stringify(onlineUsersResponseFriend));
	}
}
