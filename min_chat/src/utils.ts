import { Client } from "./Client";
import { onlineClients } from "./server";

// TODO for debugging purposes
async function errorCaught(error: unknown, client: Client): Promise<void> {
	console.error(`${error}`);
	client.getSocket().send(
		JSON.stringify({
			error: true,
			senderId: client.getId(),
			errorMessage: `${error}`,
		}),
	);
}

async function roomIdHandler(
	client: Client,
	friendClient: Client,
): Promise<void> {
	try {
		const gameIdAskedFromFilip = crypto.randomUUID();

		client.getSocket().send(
			JSON.stringify({
				startGame: true,
				roomId: gameIdAskedFromFilip,
			}),
		);
	} catch (error) {
		errorCaught(error, client);
	}
}

async function socketOpenedHandler(
	client: Client,
	friendClient: Client,
): Promise<void> {
	const url = `http://localhost:3010/playerRoom/${friendClient.getId()}`;
	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	const roomId = await response.json();
	try {
		friendClient.getSocket().send(
			JSON.stringify({
				joinRoom: true,
				roomId: roomId,
				Notification: "Open socket with provided roomID", // optional
			}),
		);
	} catch (error) {
		errorCaught(error, client);
	}
}

async function inviteAcceptedHandler(
	client: Client,
	friendClient: Client,
): Promise<void> {
	try {
		friendClient.getSocket().send(
			JSON.stringify({
				openSocket: true,
				senderId: client.getId(),
				Notification: "Open Socket and let me know", // optional
			}),
		);
	} catch (error) {
		errorCaught(error, client);
	}
}

async function inviteHandler(
	client: Client,
	friendClient: Client,
): Promise<void> {
	try {
		friendClient.getSocket().send(
			JSON.stringify({
				invite: true,
				senderId: client.getId(),
				notification: `${client.getId()} wants to play Ping Pong with you!`, // optional
			}),
		);
	} catch (error) {
		errorCaught(error, client); // for debugging purposes
	}
}

async function blockHandler(
	client: Client,
	friendClient: Client,
): Promise<void> {
	try {
		if (client.isBlocked(friendClient.getId())) {
			client.removeBlockedUser(friendClient.getId());
			console.log(
				// for debugging purposes
				`Client ${client.getId()} unblocked ${friendClient.getId()}`,
			);
			client.getSocket().send(
				// optional
				JSON.stringify({
					notification: `You have unblocked ${friendClient.getId()}`, // optional
				}),
			);
		} else {
			client.addBlockedUser(friendClient.getId());
			console.log(
				// for debugging purposes
				`Client ${client.getId()} blocked ${friendClient.getId()}`,
			);
			client.getSocket().send(
				// optional
				JSON.stringify({
					notification: `You have blocked ${friendClient.getId()}`, // optional
				}),
			);
		}
	} catch (error) {
		errorCaught(error, client); // for debugging purposes
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
				message: message,
				senderId: client.getId(),
			}),
		);
		if (!friendClient.isBlocked(client.getId())) {
			friendClient.getSocket().send(
				JSON.stringify({
					message: message,
					senderId: client.getId(),
				}),
			);
		}
	} catch (error) {
		errorCaught(error, client); // for debugging purposes
	}
}

export async function onClientMessage(
	message: string,
	client: Client,
): Promise<void> {
	try {
		console.log(`Client ${client.getId()} interacted with the server`); // for debugging purposes
		const data = JSON.parse(message.toString());
		if (data.terminate) return client.getSocket().close();
		if (!data.recipientId) throw new Error("Server: recipientId not found");
		const friendClient = onlineClients.get(data.recipientId);
		if (!friendClient) throw new Error("Server: UUID not found");
		if (client.isBlocked(friendClient.getId()) && !data.block)
			throw new Error("Server: You blocked this UUID");
		if (data.recipientId === client.getId())
			throw new Error("Server: You cannot send a message to yourself");
		if (data.message)
			await messageHandler(data.message, client, friendClient);
		else if (data.block) await blockHandler(client, friendClient);
		else if (data.invite) await inviteHandler(client, friendClient);
		else if (data.inviteAccepted)
			await inviteAcceptedHandler(client, friendClient);
		else if (data.socketOpened)
			await socketOpenedHandler(client, friendClient);
		else if (data.roomId) await roomIdHandler(client, friendClient);
		else throw new Error("Server: Unknown type in received data");
	} catch (error) {
		errorCaught(error, client);
	}
}

export async function onClientDisconnect(client: Client): Promise<void> {
	console.log(`Client ${client.getId()} disconnected`); // for debugging purposes
	onlineClients.delete(client.getId());
	onlineClients.forEach((person) => {
		person.getSocket().send(
			JSON.stringify({
				clientDisconnected: client.getId(),
			}),
		);
	});
}
