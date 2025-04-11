import { FastifyReply, FastifyRequest } from "fastify";
import {
	updateNotificationCreateFriendAndNotification,
	createFriendAndNotification,
	updateBlockStatusInDB,
} from "../../utils/dbUtils";

import {
	GetFriendListInput,
	StandardFriendListInput,
	getFriendListZodSchema,
	standardFriendListZodSchema,
	getFriendListResponseSchema,
	standardFriendListResponseSchema,
} from "./friendList.zodSchemas";

import { m } from "../../config/msgs";
import { liveClients } from "../../index";

export async function getFriendList(
	request: FastifyRequest<{ Params: GetFriendListInput }>,
	reply: FastifyReply,
): Promise<void> {
	try {
		const { userName } = getFriendListZodSchema.parse(request.params);
		const friendList = liveClients.get(userName)?.getFriendNames();
		if (friendList) {
			const parsedReply = getFriendListResponseSchema.parse({
				friendList: friendList,
			});
			return reply.status(200).send(parsedReply);
		} else {
			return reply.status(404).send({ message: m.notInitialized });
		}
	} catch (error) {
		console.error("Error in getFriendList:", error);
		return reply.status(500).send({ error });
	}
}

export async function addFriend(
	request: FastifyRequest<{ Body: StandardFriendListInput }>,
	reply: FastifyReply,
): Promise<void> {
	try {
		const { userName, friendName } = standardFriendListZodSchema.parse(
			request.body,
		);
		const client = liveClients.get(userName);
		if (client) {
			if (client.isUserFriend(friendName)) {
				return reply.status(400).send({ message: m.alreadyFriends });
			}
			await updateNotificationCreateFriendAndNotification(
				userName,
				friendName,
				m.acceptUserNotif(friendName),
				m.reqFriendNotif(friendName),
				false,
			);
			await createFriendAndNotification(
				friendName,
				userName,
				m.acceptFriendNotif(userName),
				false,
			);
			client.updateClient(friendName, m.acceptUserNotif(friendName));
			client.getSocket()?.send(
				JSON.stringify({
					notification: m.acceptUserNotif(friendName),
					pending: false,
					friendRequestAccepted: friendName,
				}),
			);

			const friendClient = liveClients.get(friendName);
			if (friendClient) {
				friendClient.updateClient(
					userName,
					m.acceptFriendNotif(userName),
				);
				friendClient.getSocket()?.send(
					JSON.stringify({
						notification: m.acceptFriendNotif(userName),
						pending: false,
						friendRequestAccepted: userName,
					}),
				);
			}
			return reply.status(200).send();
		} else {
			return reply.status(404).send({ message: m.notInitialized });
		}
	} catch (error) {
		console.error("Error in addFriendList:", error);
		return reply.status(500).send({ error });
	}
}

export async function updateBlockStatus(
	request: FastifyRequest<{ Body: StandardFriendListInput }>,
	reply: FastifyReply,
): Promise<void> {
	try {
		const { userName, friendName } = standardFriendListZodSchema.parse(
			request.body,
		);
		const client = liveClients.get(userName);
		if (client) {
			const updatedBlockStatus = !client.isUserBlocked(friendName);
			await updateBlockStatusInDB(
				userName,
				friendName,
				updatedBlockStatus,
			);
			client.updateBlockStatus(friendName, updatedBlockStatus);
			return reply.status(200).send();
		} else {
			return reply.status(404).send({ message: m.notInitialized });
		}
	} catch (error) {
		console.error("Error in updateBlockStatus:", error);
		return reply.status(500).send({ message: m.internalServerError });
	}
}
