import { FastifyReply, FastifyRequest } from "fastify";
import {
	findUserInDB,
	checkBlockStatusInDB,
	createNotificationInDB,
} from "../../utils/dbUtils";
import { RequestInput, requestZodSchema } from "./request.zodSchemas";
import { m } from "../../config/msgs";
import { liveClients } from "../../index";

export async function friendRequest(
	request: FastifyRequest<{ Body: RequestInput }>,
	reply: FastifyReply,
): Promise<void> {
	try {
		const { userName, friendName } = requestZodSchema.parse(request.body);
		if (userName === friendName) {
			return reply.status(400).send({ message: m.selfRequest });
		}
		const client = liveClients.get(userName);
		if (client) {
			if (client.isUserFriend(friendName)) {
				return reply.status(400).send({ message: m.alreadyFriends });
			} else if (client.isUserBlocked(friendName)) {
				return reply.status(400).send({ message: m.isBlocked });
			}
			const friendClient = liveClients.get(friendName);
			if (friendClient || (await findUserInDB(friendName))) {
				await createNotificationInDB(
					userName,
					m.reqUserNotif(friendName),
					false,
				);
				client.addNotification(m.reqUserNotif(friendName), false);
				client.getSocket()?.send(
					JSON.stringify({
						notification: m.reqUserNotif(friendName),
						pending: false,
						friendRequest: friendName,
					}),
				);
				if (
					!friendClient?.isUserBlocked(userName) ||
					!(await checkBlockStatusInDB(friendName, userName))
				) {
					await createNotificationInDB(
						friendName,
						m.reqFriendNotif(userName),
						true,
					);
					if (friendClient) {
						friendClient.addNotification(
							m.reqFriendNotif(userName),
							true,
						);
						friendClient.getSocket()?.send(
							JSON.stringify({
								notification: m.reqFriendNotif(userName),
								pending: true,
								friendRequest: userName,
							}),
						);
					}
				}
			} else {
				return reply.status(400).send({ message: m.userNotFound });
			}
			return reply.status(200).send();
		} else {
			return reply.status(404).send({ message: m.notInitialized });
		}
	} catch (error) {
		console.error("Error in friendRequest:", error);
		return reply.status(500).send({ error });
	}
}

export async function gameRequest(
	request: FastifyRequest<{ Body: RequestInput }>,
	reply: FastifyReply,
): Promise<void> {
	try {
		const { userName, friendName } = requestZodSchema.parse(request.body);
		if (userName === friendName) {
			reply.status(400).send({ message: m.selfRequest });
		}
		const client = liveClients.get(userName);
		if (client) {
			if (!client.isUserFriend(friendName)) {
				reply.status(400).send({ message: m.notFriends });
			} else if (client.isUserBlocked(friendName)) {
				reply.status(400).send({ message: m.isBlocked });
			}
			await createNotificationInDB(
				userName,
				m.inviteUserNotif(friendName),
				false,
			);
			client.addNotification(m.playUserNotif(friendName), false);
			client.getSocket()?.send(
				JSON.stringify({
					notification: m.playUserNotif(friendName),
					pending: false,
					gameRequest: friendName,
				}),
			);
			const friendClient = liveClients.get(friendName);
			if (
				!friendClient?.isUserBlocked(userName) ||
				!(await checkBlockStatusInDB(friendName, userName))
			) {
				await createNotificationInDB(
					friendName,
					m.inviteFriendNotif(userName),
					true,
				);
				if (friendClient) {
					friendClient.addNotification(
						m.inviteFriendNotif(userName),
						true,
					);
					friendClient.getSocket()?.send(
						JSON.stringify({
							notification: m.inviteFriendNotif(userName),
							pending: true,
							gameRequest: userName,
						}),
					);
				}
			}
			reply.status(200).send();
		} else {
			reply.status(404).send({ message: m.notInitialized });
		}
	} catch (error) {
		console.error("Error in gameRequest:", error);
		reply.status(500).send({ error });
	}
}
