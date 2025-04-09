import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createUserInDB(userName: string) {
	const newUser = await prisma.user.create({
		data: {
			userName: userName,
		},
	});
	return newUser;
}

export async function findUserInDB(userName: string) {
	const existingClient = await prisma.user.findUnique({
		where: {
			userName: userName,
		},
		include: {
			friendList: true,
			notifications: true,
		},
	});
	return existingClient;
}

export async function findChatHistoryInDB(
	userName: string,
	chatPartner: string,
) {
	const sortUsers = [userName, chatPartner].sort();
	const chatId = sortUsers.join("-");
	const chatHistory = await prisma.conversation.findUnique({
		where: {
			conversationId: chatId,
		},
		select: {
			messages: {
				where: {
					NOT: {
						AND: [{ sender: chatPartner }, { block: true }],
					},
				},
				select: {
					message: true,
					sender: true,
				},
			},
		},
	});

	return chatHistory?.messages || [];
}

export async function createNotificationInDB(
	userName: string,
	notification: string,
	pending: boolean,
) {
	await prisma.user.update({
		where: {
			userName: userName,
		},
		data: {
			notifications: {
				create: {
					notification: notification,
					pending: pending,
				},
			},
		},
	});
}

export async function checkBlockStatusInDB(
	userName: string,
	friendName: string,
) {
	const existingUser = await prisma.user.findUnique({
		where: {
			userName: userName,
		},
		include: {
			friendList: {
				where: {
					friendName: friendName,
				},
				select: {
					block: true,
				},
			},
		},
	});

	if (
		!existingUser ||
		!existingUser.friendList ||
		existingUser.friendList.length === 0
	) {
		console.log("Warning: Friend not found or friend list is empty");
		return false;
	}
	const blockStatus = existingUser.friendList[0].block;
	return blockStatus;
}

export async function updateBlockStatusInDB(
	userName: string,
	friendName: string,
	blockStatus: boolean,
) {
	await prisma.user.update({
		where: {
			userName: userName,
		},
		data: {
			friendList: {
				updateMany: {
					where: {
						friendName: friendName,
					},
					data: {
						block: blockStatus,
					},
				},
			},
		},
	});
}

export async function updateNotificationCreateFriendAndNotification(
	userName: string,
	friendName: string,
	notification: string,
	updateNotificationStatus: string,
	pending: boolean,
) {
	await prisma.user.update({
		where: {
			userName: userName,
		},
		data: {
			friendList: {
				create: {
					friendName: friendName,
					block: false,
				},
			},
			notifications: {
				create: {
					notification: notification,
					pending: pending,
				},
				updateMany: {
					where: {
						notification: updateNotificationStatus,
					},
					data: {
						pending: pending,
					},
				},
			},
		},
	});
}

export async function createFriendAndNotification(
	userName: string,
	friendName: string,
	notification: string,
	pending: boolean,
) {
	await prisma.user.update({
		where: {
			userName: userName,
		},
		data: {
			friendList: {
				create: {
					friendName: friendName,
					block: false,
				},
			},
			notifications: {
				create: {
					notification: notification,
					pending: pending,
				},
			},
		},
	});
}

export async function addMessageToDatabase(
	sender: string,
	receiver: string,
	message: string,
	isBlocked: boolean,
) {
	console.log("Adding message to conversation...");
	const sortUsers = [sender, receiver].sort();
	const conversationId = `${sortUsers[0]}-${sortUsers[1]}`;
	const existingConversation = await prisma.conversation.findFirst({
		where: {
			conversationId: conversationId,
		},
	});
	if (!existingConversation) {
		console.log("Conversation not found, creating new conversation...");
		const newConversation = await prisma.conversation.create({
			data: {
				conversationId: conversationId,
				user1: sortUsers[0],
				user2: sortUsers[1],
				messages: {
					create: [
						{
							sender: sender,
							message: message,
							block: isBlocked,
						},
					],
				},
			},
		});
	} else {
		console.log("Adding message to existing conversation...");
		const updatedConversation = await prisma.conversation.update({
			where: {
				id: existingConversation.id,
			},
			data: {
				messages: {
					create: [
						{
							sender: sender,
							message: message,
							block: isBlocked,
						},
					],
				},
			},
		});
	}
}
