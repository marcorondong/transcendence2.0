import { FastifyReply, FastifyRequest } from "fastify";
// import { sessionInput, sessionResponseInput, sessionResponseSchema, chatHistoryResponseSchema , chatHistoryInput, friendRequestInput, friendRequestResponseSchema} from "./session.zodSchemas";
import {
	sessionInput,
	sessionZodResponseSchema,
	standardInput,
	standardZodResponseSchema,
	chatHistoryResponseSchema,
} from "./session.zodSchemas";
import { errorHandler } from "../../utils/errors";
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
						.filter((friend) => friend.block === true) // Filter out only blocked friends
						.map((friend) => friend.friendName),
				); // Extract the friend names
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
		// errorHandler(error, req, reply);
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
			liveClients.get(userName)?.getSocket()?.close();
			console.log("Client socket closed by terminateUserSession");
			// liveClients.delete(userName);
			// console.log("Client removed from memory:", userName);
			parsedUser.message = "Client has been terminated";
			reply.code(200).send(parsedUser);
		}
	} catch (error) {
		console.error("Error terminating user session:", error);
		// errorHandler(error, request, reply);
		return reply.code(500).send(error);
	}
}

export async function provideChatHistory(
	request: FastifyRequest<{ Body: standardInput }>,
	reply: FastifyReply,
) {
	try {
		const user = request.body as standardInput;
		const userName = user.userName;
		const friendName = user.friendName;
		const client = liveClients.get(userName);
		const parsedUser = chatHistoryResponseSchema.parse(user);
		if (!client) {
			console.log("Warning: Client does not exist in memory");
			// parsedUser.chatHistory = [];
			parsedUser.message =
				"Warning: Client does not exist in memory to retrieve chat history";
			reply.code(409).send(parsedUser);
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
				parsedUser.chatHistory = chatHistory;
				parsedUser.blockButton = client.isUserBlocked(friendName);
				parsedUser.message =
					"Chat history has been retrieved from database";
				reply.code(200).send(parsedUser);
			} else {
				console.log("Chat history exists in memory");
				parsedUser.chatHistory =
					client
						.getChatHistory()
						.get(friendName)
						?.map((message) => ({
							message: message.getMessage(),
							sender: message.getSender(),
						})) || [];
				parsedUser.blockButton = client.isUserBlocked(friendName);
				parsedUser.message =
					"Chat history has been retrieved from memory";
				reply.code(200).send(parsedUser);
			}
		}
	} catch (error) {
		console.error("Error providing chat history:", error);
		return reply.code(500).send(error);
	}
}

export async function friendRequest(
	request: FastifyRequest<{ Body: standardInput }>,
	reply: FastifyReply,
) {
	try {
		const data = request.body as standardInput;
		const userName = data.userName;
		const friendName = data.friendName;
		const parsedUser = standardZodResponseSchema.parse(data);

		if (!userName || !friendName || userName === friendName) {
			console.log("Warning: Invalid friend request");
			const parsedUser = standardZodResponseSchema.parse(data);
			parsedUser.message = "Warning: Invalid friend request";
			reply.code(409).send(parsedUser);
			return;
		}

		const client = liveClients.get(userName);

		if (!client) {
			console.log(
				"Warning: Client does not exist in memory (not initialized)",
			);
			parsedUser.message =
				"Warning: Client does not exist in memory to send friend request (not initialized)";
			reply.code(409).send(parsedUser);
			return;
		}

		if (client.isUserFriend(friendName)) {
			console.log("Warning: Already friends");
			parsedUser.message = "Warning: Already friends";
			reply.code(409).send(parsedUser);
			return;
		} else if (client.isUserBlocked(friendName)) {
			console.log("Warning: User is blocked");
			parsedUser.message = "Warning: User is blocked";
			reply.code(409).send(parsedUser);
			return;
		}

		const friendClient = liveClients.get(friendName);
		let friendExist = false;

		if (friendClient) {
			friendExist = true;
		} else if (await findUserInDB(friendName)) {
			friendExist = true;
		}
		if (!friendExist) {
			console.log("Warning: No such user registered");
			parsedUser.message = "Warning: Friend does not exist in database";
			reply.code(409).send(parsedUser);
			return;
		}

		const userNameNotification = `${friendName} has been invited to be your friend`;
		const friendNameNotification = `${userName} has invited you to be friends`;
		await createNotificationInDB(userName, userNameNotification, false);

		let blocked: boolean = false;
		if (friendClient) {
			blocked = friendClient.isUserBlocked(userName);
		} else {
			blocked = await checkBlockStatusInDB(friendName, userName);
		}
		if (!blocked) {
			await createNotificationInDB(
				friendName,
				friendNameNotification,
				true,
			);
		}

		client.getSocket()?.send(
			JSON.stringify({
				notification: userNameNotification,
				pending: false,
				friendRequest: friendName,
			}),
		);
		if (friendClient) {
			if (!blocked) {
				friendClient.getSocket()?.send(
					JSON.stringify({
						notification: friendNameNotification,
						pending: true,
						friendRequest: userName,
					}),
				);
			}
		}
		parsedUser.message = "Friend request sent";
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
			console.log("Warning: Client does not exist in memory");
			parsedUser.message =
				"Warning: Client does not exist in memory to accept friend request";
			reply.code(409).send(parsedUser);
		} else {
			if (!client.isUserFriend(friendName)) {
				console.log("Friend request accepted");
				const userNameNotification = `${friendName}'s friend request has been accepted`;
				const friendNameNotification = `${userName} has accepted your friend request`;
				const updateNotification = `${friendName} has invited you to be friends`;
				await updateNotificationCreateFriendAndNotification(
					userName,
					friendName,
					userNameNotification,
					updateNotification,
					false,
				);
				await createFriendAndNotification(
					friendName,
					userName,
					friendNameNotification,
					false,
				);
				client.addToFriendList(friendName);
				client.getChatHistory().set(friendName, []);
				client.getSocket()?.send(
					JSON.stringify({
						notification: userNameNotification,
						pending: false,
						friendRequestAccepted: friendName,
					}),
				);
				const friendClient = liveClients.get(friendName);
				if (friendClient) {
					friendClient.addToFriendList(userName);
					friendClient.getChatHistory().set(userName, []);
					friendClient.getSocket()?.send(
						JSON.stringify({
							notification: friendNameNotification,
							pending: false,
							friendRequestAccepted: userName,
						}),
					);
				}
				console.log("Friend request accepted and saved to database");
				parsedUser.message =
					"Friend request accepted and saved to database";
				reply.code(201).send(parsedUser);
			} else {
				console.log("Warning: They are already friends");
				parsedUser.message = "Warning: They are already friends";
				reply.code(409).send(parsedUser);
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
			console.log("Warning: Client does not exist in memory");
			parsedUser.message =
				"Warning: Client does not exist in memory to update block status";
			reply.code(409).send(parsedUser);
		} else {
			if (client.isUserBlocked(friendName)) {
				console.log("Unblocking friend");
				await updateBlockStatusInDB(userName, friendName, false);
				client.removeFromBlockList(friendName);
				console.log("Friend unblocked and saved to database");
				parsedUser.message = "Friend unblocked and saved to database";
				reply.code(200).send(parsedUser);
			} else if (client.isUserFriend(friendName)) {
				console.log("Blocking friend");
				await updateBlockStatusInDB(userName, friendName, true);
				client.addToBlockList(friendName);
				console.log("Friend blocked and saved to database");
				parsedUser.message = "Friend blocked and saved to database";
				reply.code(200).send(parsedUser);
			} else {
				console.log("Warning: Not friends");
				parsedUser.message = "Warning: Not friends";
				reply.code(409).send(parsedUser);
			}
		}
	} catch (error) {
		console.error("Error updating block status:", error);
		reply.code(500).send(error);
		return error;
	}
}

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
			console.log("Warning: Client does not exist in memory");
			parsedUser.message =
				"Warning: Client does not exist in memory to invite to play";
			reply.code(409).send(parsedUser);
		} else {
			const userNameNotification = `${friendName} has been invited to play`;
			const friendNameNotification = `${userName} has invited you to play`;
			if (
				client.isUserFriend(friendName) &&
				!client.isUserBlocked(friendName)
			) {
				await createNotificationInDB(
					userName,
					userNameNotification,
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
						friendNameNotification,
						true,
					);
				}

				client.getSocket()?.send(
					JSON.stringify({
						notification: userNameNotification,
						pending: false,
						inviteToPlay: friendName,
					}),
				);
				if (friendClient) {
					if (!blocked) {
						friendClient.getSocket()?.send(
							JSON.stringify({
								notification: friendNameNotification,
								pending: true,
								inviteToPlay: userName,
							}),
						);
					}
				}
				console.log("Friend invited to play");
				parsedUser.message = "Friend invited to play";
				reply.code(200).send(parsedUser);
			} else {
				console.log("Warning: Not friends or blocked");
				parsedUser.message = "Warning: Not friends or blocked";
				reply.code(409).send(parsedUser);
			}
		}
	} catch (error) {
		console.error("Error inviting to play:", error);
		reply.code(500).send(error);
		return error;
	}
}

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
			console.log("Warning: Client does not exist in memory");
			parsedUser.message =
				"Warning: Client does not exist in memory to accept invite";
			reply.code(409).send(parsedUser);
		} else {
			if (client.isUserFriend(friendName)) {
				console.log("Invite accepted");
				const userNameNotification = `${friendName}'s invite has been accepted`;
				const friendNameNotification = `${userName} has accepted your invite`;
				const updateNotification = `${friendName} has invited you to play`;
				await updateNotificationCreateFriendAndNotification(
					userName,
					friendName,
					userNameNotification,
					updateNotification,
					false,
				);
				await createFriendAndNotification(
					friendName,
					userName,
					friendNameNotification,
					false,
				);
				client.getSocket()?.send(
					JSON.stringify({
						notification: userNameNotification,
						pending: false,
						inviteAccepted: friendName,
					}),
				);
				const friendClient = liveClients.get(friendName);
				if (friendClient) {
					friendClient.getSocket()?.send(
						JSON.stringify({
							notification: friendNameNotification,
							pending: false,
							inviteAccepted: userName,
						}),
					);
				}
				console.log("Invite accepted and saved to database");
				parsedUser.message = "Invite accepted and saved to database";
				reply.code(200).send(parsedUser);
			} else {
				console.log("Warning: Not friends");
				parsedUser.message = "Warning: Not friends";
				reply.code(409).send(parsedUser);
			}
		}
	} catch (error) {
		console.error("Error inviting to play:", error);
		reply.code(500).send(error);
		return error;
	}
}
