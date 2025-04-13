import { Client } from "./Client";
import { onlineClients } from "./server";

async function inviteAcceptedHandler(
	client: Client, friendClient: Client): Promise<void> {
	try {
		friendClient.getSocket().send(
			JSON.stringify({
				type: "inviteAccepted",
				id: client.getId(),
				message: `${client.getId()} accepted your invite!`,
			}),
		);
		client.getSocket().send(
			JSON.stringify({
				type: "inviteAcceptedDelivered",
				id: client.getId(),
				message: `${friendClient.getId()} has got your notification that you accepted the invite!`,
			}),
		);
	}
	catch (error) {
		console.error(`${error}`);
		client.getSocket().send(
			JSON.stringify({
				type: "error",
				id: client.getId(),
				message: `${error}`,
			}),
		);
	}
}

async function inviteHandler(client: Client, friendClient: Client): Promise<void> {
	try {
		friendClient.getSocket().send(
			JSON.stringify({
				type: "invite",
				id: client.getId(),
				message: `${client.getId()} wants to play Ping Pong with you!`,
			}),
		);
		client.getSocket().send(
			JSON.stringify({
				type: "inviteDelivered",
				id: client.getId(),
				message: `Your invite has been delivered to ${friendClient.getId()}`,
			}),
		);
	} catch (error) {
		console.error(`${error}`);
		client.getSocket().send(
			JSON.stringify({
				type: "error",
				id: client.getId(),
				message: `${error}`,
			}),
		);
	}
}
		
async function blockHandler(client: Client, friendClient: Client): Promise<void> {
	try {
		if (client.isBlocked(friendClient.getId())) {
			client.removeBlockedUser(friendClient.getId());
			client.getSocket().send(
				JSON.stringify({
					type: "unblock",
					id: client.getId(),
					message: `You have unblocked ${friendClient.getId()}`,
				}),
			);
		} else {
			client.addBlockedUser(friendClient.getId());
			client.getSocket().send(
				JSON.stringify({
					type: "block",
					id: client.getId(),
					message: `You have blocked ${friendClient.getId()}`,
				}),
			);
		}
	} catch (error) {
		console.error(`${error}`);
		client.getSocket().send(
			JSON.stringify({
				type: "error",
				id: client.getId(),
				message: `${error}`,
			}),
		);
	}
}

async function messageHandler(
	message: string,
	client: Client,
	friendClient: Client,
): Promise<void> {
	try {
		client.getSocket().send(
			JSON.stringify({
				type: "message",
				id: client.getId(),
				message: message,
			}),
		);
		if (!friendClient.isBlocked(client.getId())) {
			friendClient.getSocket().send(
				JSON.stringify({
					type: "message",
					id: client.getId(),
					message: message,
				}),
			);
		}
	} catch (error) {
		console.error(`${error}`);
		client.getSocket().send(
			JSON.stringify({
				type: "error",
				id: client.getId(),
				message: `${error}`,
			}),
		);
	}
}

export async function onClientMessage(
	message: string,
	client: Client,
): Promise<void> {
	try {
		const data = JSON.parse(message.toString());
		console.log("Parsed message:", data);
		if (
			typeof data === "object" &&
			data !== null &&
			typeof data.type === "string" &&
			typeof data.id === "string" &&
			typeof data.message === "string" &&
			Object.keys(data).length === 3
		) {
			const friendClient = onlineClients.get(data.id);
			if (!friendClient) {
				throw new Error("Server: UUID not found");
			}
			if (client.isBlocked(friendClient.getId()) && data.type !== "block") {
				throw new Error("Server: You blocked this UUID");
			}
			if (data.id === client.getId()) {
				throw new Error("Server: You cannot send a message to yourself");
			}
			if (data.type === "message") {
				messageHandler(data.message, client, friendClient);
			} else if (data.type === "block") {
				blockHandler(client, friendClient);
			} else if (data.type === "invite") {
				inviteHandler(client, friendClient);
			} else if (data.type === "inviteAccepted") {
				inviteAcceptedHandler(client, friendClient);
			} else {
				throw new Error("Server: Unknown type in received data");
			}
		} else {
			throw new Error("Server: Wrong data format");
		}
	} catch (error) {
		console.error(`${error}`);
		client.getSocket().send(
			JSON.stringify({
				type: "error",
				id: client.getId(),
				message: `${error}`,
			}),
		);
	}
}

export async function onClientDisconnect(client: Client): Promise<void> {
	console.log(`Client ${client.getId()} disconnected`);
}
