import { FastifyReply, FastifyRequest } from "fastify";
import {
	sessionInput,
	sessionZodResponseSchema,
	standardInput,
	standardZodResponseSchema,
	chatHistoryResponseSchema,
} from "./session.zodSchemas";
import { Client } from "../../Client";
import { liveClients } from "../../index";
import { Message } from "../../Message";
import { Notification } from "../../Notification";
import {
	checkBlockStatusInDB,
	createNotificationInDB,
	createUserInDB,
	findChatHistoryInDB,
	findUserInDB,
	updateNotificationCreateFriendAndNotification,
	createFriendAndNotification,
	updateBlockStatusInDB,
} from "../../utils/dbUtils";
import { m } from "../../config/msgs";

export async function initializeUserSession(
	request: FastifyRequest<{ Body: sessionInput }>,
	reply: FastifyReply,
) {
	try {
		const user = request.body as sessionInput;
		const userName = user.userName;
		const parsedUser = sessionZodResponseSchema.parse(user);
		if (liveClients.has(userName)) {
			console.log("Warning: Client already exists in memory");
			parsedUser.message =
				"Warning: Client already exists in memory to initialize";
			reply.code(400).send(parsedUser);
		} else {
			const existingClient = await findUserInDB(userName);
			if (existingClient) {
				console.log("Client already exists in database");
				const friendList = new Set(
					existingClient.friendList.map(
						(friend) => friend.friendName,
					),
				);
				const blockedList = new Set(
					existingClient.friendList
						.filter((friend) => friend.block === true)
						.map((friend) => friend.friendName),
				);
				const notifications = new Set(
					existingClient.notifications.map(
						(notification) =>
							new Notification(
								notification.notification,
								notification.pending,
							),
					),
				);
				const client = new Client(
					userName,
					friendList,
					blockedList,
					notifications,
				);
				liveClients.set(userName, client);
				console.log("Client added to memory:", existingClient);
				parsedUser.message =
					"Client has been initialized from database";
				reply.code(200).send(parsedUser);
			} else {
				console.log("New Client in database");
				await createUserInDB(userName);
				const client = new Client(userName);
				liveClients.set(userName, client);
				console.log("Client added to memory:", userName);
				parsedUser.message = "Client and Database has been initialized";
				reply.code(201).send(parsedUser);
			}
		}
	} catch (error) {
		console.error("Error initializing user session:", error);
		return reply.code(500).send(error);
	}
}

export async function terminateUserSession(
	request: FastifyRequest<{ Body: sessionInput }>,
	reply: FastifyReply,
) {
	try {
		// should I remove the client from memory?
		const user = request.body as sessionInput;
		const userName = user.userName;
		const parsedUser = sessionZodResponseSchema.parse(user);
		if (!liveClients.has(userName)) {
			console.log("Warning: Client does not exist in memory");
			parsedUser.message =
				"Warning: Client does not exist in memory to terminate";
			reply.code(409).send(parsedUser);
		} else {
			const socket = liveClients.get(userName)?.getSocket();
			if (socket) {
				socket.close();
				console.log("Client socket closed by terminateUserSession");
			} else {
				console.log(
					"Warning: Client not connected. Deleting from memory",
				);
				liveClients.delete(userName);
			}
			parsedUser.message = "Client has been terminated";
			reply.code(200).send(parsedUser);
		}
	} catch (error) {
		console.error("Error terminating user session:", error);
		return reply.code(500).send(error);
	}
}

export async function provideChatHistory(
	request: FastifyRequest<{ Body: standardInput }>,
	reply: FastifyReply,
) {
	try {
		const user = request.body;
		const userName = user.userName;
		const friendName = user.friendName;
		const client = liveClients.get(userName);
		if (userName === friendName) {
			console.log("Warning: userName and friendName cannot be the same");
			return reply.code(409).send(
				JSON.stringify({
					userName: userName,
					friendName: friendName,
					chatHistory: [],
					blockButton: false,
					message:
						"Warning: userName and friendName cannot be the same",
				}),
			);
		}
		if (!client) {
			console.log("Warning: Client does not exist in memory");
			return reply.code(409).send(
				JSON.stringify({
					userName: userName,
					friendName: friendName,
					chatHistory: [],
					blockButton: false,
					message: "Warning: Client does not exist in memory",
				}),
			);
		} else {
			if (!client.getChatHistory().has(friendName)) {
				console.log(
					"Chat history does not exist in memory. Fetching from database...",
				);
				const chatHistory = await findChatHistoryInDB(
					userName,
					friendName,
				);
				const messages = chatHistory.map(
					(message) => new Message(message.message, message.sender),
				);
				client.getChatHistory().set(friendName, messages);
				reply.code(200).send(
					JSON.stringify({
						userName: userName,
						friendName: friendName,
						chatHistory: chatHistory,
						blockButton: client.isUserBlocked(friendName),
						message:
							"Chat history has been retrieved from database",
					}),
				);
			} else {
				console.log("Chat history exists in memory");
				const history =
					client
						.getChatHistory()
						.get(friendName)
						?.map((message) => ({
							message: message.getMessage(),
							sender: message.getSender(),
						})) || [];
				reply.code(200).send(
					JSON.stringify({
						userName: userName,
						friendName: friendName,
						chatHistory: history,
						blockButton: client.isUserBlocked(friendName),
						message: "Chat history has been retrieved from memory",
					}),
				);
			}
		}
	} catch (error) {
		console.error("Error providing chat history:", error);
		return reply.code(500).send(error);
	}
}

export async function provideNotifications(
	request: FastifyRequest<{ Body: sessionInput }>,
	reply: FastifyReply,
) {
	try {
		const user = request.body as sessionInput;
		const userName = user.userName;
		if (!liveClients.has(userName)) {
			console.log("Warning: Client does not exist in memory");
			return reply.code(409).send(
				JSON.stringify({
					userName: userName,
					notification: "",
					pending: false,
					message: "Warning: Client does not exist in memory",
				}),
			);
		} else {
			const client = liveClients.get(userName);
			if (client) {
				const notifications = client
					.getNotifications()
					.map((notification) => ({
						notification: notification.getNotification(),
						pending: notification.getPending(),
					}));
				reply.code(200).send(
					JSON.stringify({
						userName: userName,
						notification: notifications,
						message:
							"Notifications have been retrieved from memory",
					}),
				);
			}
		}
	} catch (error) {
		console.error("Error providing notifications:", error);
		return reply.code(500).send(error);
	}
}

export async function friendRequest(
	request: FastifyRequest<{ Body: standardInput }>,
	reply: FastifyReply,
) {
	try {
		const data = request.body;
		const userName = data.userName;
		const friendName = data.friendName;
		const parsedUser = standardZodResponseSchema.parse(data);
		if (userName === friendName) {
			parsedUser.message = m.invalid;
			console.log(parsedUser);
			return reply.code(409).send(parsedUser);
		}
		const client = liveClients.get(userName);
		if (!client) {
			parsedUser.message = m.notInitialized;
			console.log(parsedUser);
			return reply.code(409).send(parsedUser);
		}
		if (client.isUserFriend(friendName)) {
			parsedUser.message = m.alreadyFriends;
			console.log(parsedUser);
			return reply.code(409).send(parsedUser);
		} else if (client.isUserBlocked(friendName)) {
			parsedUser.message = m.isBlocked;
			console.log(parsedUser);
			return reply.code(409).send(parsedUser);
		}
		const friendClient = liveClients.get(friendName);
		let friendExist = false;
		if (friendClient) {
			friendExist = true;
		} else if (await findUserInDB(friendName)) {
			friendExist = true;
		}
		if (!friendExist) {
			parsedUser.message = m.userNotFound;
			console.log(parsedUser);
			return reply.code(409).send(parsedUser);
		}
		await createNotificationInDB(
			userName,
			m.reqUserNotif(friendName),
			false,
		);
		let blocked: boolean = false;
		if (friendClient) {
			blocked = friendClient.isUserBlocked(userName);
		} else {
			blocked = await checkBlockStatusInDB(friendName, userName);
		}
		if (!blocked) {
			await createNotificationInDB(
				friendName,
				m.reqFriendNotif(userName),
				true,
			);
		}
		client.getSocket()?.send(
			JSON.stringify({
				notification: m.reqUserNotif(friendName),
				pending: false,
				friendRequest: friendName,
			}),
		);
		client.addNotification(m.reqUserNotif(friendName), false);
		if (friendClient) {
			if (!blocked) {
				friendClient.addNotification(m.reqFriendNotif(userName), true);
				friendClient.getSocket()?.send(
					JSON.stringify({
						notification: m.reqFriendNotif(userName),
						pending: true,
						friendRequest: userName,
					}),
				);
			}
		}
		parsedUser.message = m.successMsg;
		reply.code(200).send(parsedUser);
	} catch (error) {
		console.error("Error sending friend request:", error);
		return reply.code(500).send(error);
	}
}

export async function friendRequestAccepted(
	request: FastifyRequest<{ Body: standardInput }>,
	reply: FastifyReply,
) {
	try {
		const user = request.body as standardInput;
		const userName = user.userName;
		const friendName = user.friendName;
		const client = liveClients.get(userName);
		const parsedUser = standardZodResponseSchema.parse(user);
		if (!client) {
			parsedUser.message = m.notInitialized;
			console.log(parsedUser);
			return reply.code(409).send(parsedUser);
		} else {
			if (!client.isUserFriend(friendName)) {
				console.log("Friend request accepted");
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
				client.addToFriendList(friendName);
				client.getChatHistory().set(friendName, []);
				client.addNotification(m.acceptUserNotif(friendName), false);
				client.getSocket()?.send(
					JSON.stringify({
						notification: m.acceptUserNotif(friendName),
						pending: false,
						friendRequestAccepted: friendName,
					}),
				);
				const friendClient = liveClients.get(friendName);
				if (friendClient) {
					friendClient.addToFriendList(userName);
					friendClient.getChatHistory().set(userName, []);
					friendClient.addNotification(
						m.acceptFriendNotif(userName),
						false,
					);
					friendClient.getSocket()?.send(
						JSON.stringify({
							notification: m.acceptFriendNotif(userName),
							pending: false,
							friendRequestAccepted: userName,
						}),
					);
				}
				parsedUser.message = m.successMsg;
				console.log(parsedUser);
				return reply.code(201).send(parsedUser);
			} else {
				parsedUser.message = m.alreadyFriends;
				console.log(parsedUser);
				return reply.code(409).send(parsedUser);
			}
		}
	} catch (error) {
		console.error("Error accepting friend request:", error);
		return reply.code(500).send(error);
	}
}

export async function updateBlockStatus(
	request: FastifyRequest<{ Body: standardInput }>,
	reply: FastifyReply,
) {
	try {
		const user = request.body as standardInput;
		const userName = user.userName;
		const friendName = user.friendName;
		const client = liveClients.get(userName);
		const parsedUser = standardZodResponseSchema.parse(user);
		if (!client) {
			parsedUser.message = m.notInitialized;
			console.log(parsedUser);
			return reply.code(409).send(parsedUser);
		} else {
			if (client.isUserBlocked(friendName)) {
				await updateBlockStatusInDB(userName, friendName, false);
				client.removeFromBlockList(friendName);
				parsedUser.message = m.unblock;
				console.log(parsedUser);
				return reply.code(200).send(parsedUser);
			} else if (client.isUserFriend(friendName)) {
				await updateBlockStatusInDB(userName, friendName, true);
				client.addToBlockList(friendName);
				parsedUser.message = m.block;
				console.log(parsedUser);
				return reply.code(200).send(parsedUser);
			} else {
				parsedUser.message = m.notFriends;
				console.log(parsedUser);
				return reply.code(409).send(parsedUser);
			}
		}
	} catch (error) {
		console.error("Error updating block status:", error);
		return reply.code(500).send(error);
	}
}

// TODO: Refactor this function
export async function inviteToPlay(
	request: FastifyRequest<{ Body: standardInput }>,
	reply: FastifyReply,
) {
	try {
		const user = request.body as standardInput;
		const userName = user.userName;
		const friendName = user.friendName;
		const client = liveClients.get(userName);
		const parsedUser = standardZodResponseSchema.parse(user);
		if (!client) {
			parsedUser.message = m.notInitialized;
			console.log(parsedUser);
			return reply.code(409).send(parsedUser);
		} else if (!client.isUserFriend(friendName)) {
			parsedUser.message = m.notFriends;
			console.log(parsedUser);
			return reply.code(409).send(parsedUser);
		} else {
			if (!client.isUserBlocked(friendName)) {
				await createNotificationInDB(
					userName,
					m.inviteUserNotif(friendName),
					false,
				);
				const friendClient = liveClients.get(friendName);
				let blocked: boolean = false;
				if (friendClient) {
					blocked = friendClient.isUserBlocked(userName);
				} else {
					blocked = await checkBlockStatusInDB(friendName, userName);
				}
				if (!blocked) {
					await createNotificationInDB(
						friendName,
						m.inviteFriendNotif(userName),
						true,
					);
				}
				client.addNotification(m.inviteUserNotif(friendName), false);
				client.getSocket()?.send(
					JSON.stringify({
						notification: m.inviteUserNotif(friendName),
						pending: false,
						inviteToPlay: friendName,
					}),
				);
				if (friendClient) {
					if (!blocked) {
						friendClient.addNotification(
							m.inviteFriendNotif(userName),
							true,
						);
						friendClient.getSocket()?.send(
							JSON.stringify({
								notification: m.inviteFriendNotif(userName),
								pending: true,
								inviteToPlay: userName,
							}),
						);
					}
				}
				parsedUser.message = m.successMsg;
				console.log(parsedUser);
				return reply.code(200).send(parsedUser);
			} else {
				parsedUser.message = m.isBlocked;
				console.log(parsedUser);
				return reply.code(409).send(parsedUser);
			}
		}
	} catch (error) {
		console.error("Error inviting to play:", error);
		return reply.code(500).send(error);
	}
}

// TODO: Refactor this function
export async function acceptPlayInvite(
	request: FastifyRequest<{ Body: standardInput }>,
	reply: FastifyReply,
) {
	try {
		const user = request.body as standardInput;
		const userName = user.userName;
		const friendName = user.friendName;
		const client = liveClients.get(userName);
		const parsedUser = standardZodResponseSchema.parse(user);
		if (!client) {
			parsedUser.message = m.notInitialized;
			console.log(parsedUser);
			return reply.code(409).send(parsedUser);
		} else {
			if (client.isUserFriend(friendName)) {
				const isThereInvitation = client
					.getNotifications()
					.some(
						(notification) =>
							notification.getNotification() ===
								m.inviteFriendNotif(friendName) &&
							notification.getPending() === true,
					);
				if (!isThereInvitation) {
					parsedUser.message = m.notInvited;
					console.log(parsedUser);
					return reply.code(409).send(parsedUser);
				}
				await updateNotificationCreateFriendAndNotification(
					userName,
					friendName,
					m.playUserNotif(friendName),
					m.inviteFriendNotif(friendName),
					false,
				);
				await createFriendAndNotification(
					friendName,
					userName,
					m.playFriendNotif(userName),
					false,
				);
				client.updateNotification(
					m.inviteFriendNotif(friendName),
					false,
				);
				client.addNotification(m.playUserNotif(friendName), false);
				client.getSocket()?.send(
					JSON.stringify({
						notification: m.playUserNotif(friendName),
						pending: false,
						inviteAccepted: friendName,
					}),
				);
				const friendClient = liveClients.get(friendName);
				if (friendClient) {
					friendClient.addNotification(
						m.playFriendNotif(userName),
						false,
					);
					friendClient.getSocket()?.send(
						JSON.stringify({
							notification: m.playFriendNotif(userName),
							pending: false,
							inviteAccepted: userName,
						}),
					);
				}
				parsedUser.message = m.successMsg;
				console.log(parsedUser);
				return reply.code(200).send(parsedUser);
			} else {
				parsedUser.message = m.notFriends;
				console.log(parsedUser);
				return reply.code(409).send(parsedUser);
			}
		}
	} catch (error) {
		console.error("Error inviting to play:", error);
		return reply.code(500).send(error);
	}
}
