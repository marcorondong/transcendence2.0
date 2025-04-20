import { Client } from "./Client";
import { onlineClients } from "./server";
import { patchRequestBlockUser, patchRequestUnblockUser } from "./dbUtils";

// TODO for debugging purposes
function errorCaught(error: unknown, client: Client) {
	console.error(`${error}`);
	client.getSocket().send(
		JSON.stringify({
			error: true,
			relatedId: client.getId(),
			errorMessage: `${error}`,
		}),
	);
}

async function socketOpenedHandler(
	client: Client,
	friendClient: Client,
): Promise<void> {
	try {
		// TODO filip's api end point. For now, we are using a mock UUID
		// const url = `http://localhost:3010/playerRoom/${friendClient.getId()}`;
		// const response = await fetch(url, {
		// 	method: "GET",
		// 	headers: {
		// 		"Content-Type": "application/json",
		// 	},
		// });
		// if (!response.ok) {
		// 	throw new Error("Network response was not ok");
		// }
		// const roomId = await response.json();
		const roomId = crypto.randomUUID(); // TODO for debugging purposes
		friendClient.getSocket().send(
			JSON.stringify({
				joinRoom: true,
				roomId: roomId,
				Notification: "Open socket with provided roomID", // TODO for debugging purposes
			}),
		);
	} catch (error) {
		errorCaught(error, client);
	}
}

function inviteAcceptedHandler(client: Client, friendClient: Client) {
	try {
		friendClient.getSocket().send(
			JSON.stringify({
				openSocket: true,
				relatedId: client.getId(),
				Notification: "Open Socket and let me know", // TODO for debugging purposes
			}),
		);
	} catch (error) {
		errorCaught(error, client);
	}
}

function inviteHandler(client: Client, friendClient: Client) {
	try {
		friendClient.getSocket().send(
			JSON.stringify({
				invite: true,
				relatedId: client.getId(),
				notification: `${client.getId()} wants to play Ping Pong with you!`, // TODO for debugging purposes
			}),
		);
	} catch (error) {
		errorCaught(error, client);
	}
}

async function blockHandler(client: Client, friendClient: Client) {
	try {
		if (client.isBlocked(friendClient.getId())) {
			await patchRequestUnblockUser(client.getId(), friendClient.getId());
			client.removeBlockedUser(friendClient.getId());
		} else {
			await patchRequestBlockUser(client.getId(), friendClient.getId());
			client.addBlockedUser(friendClient.getId());
		}
		console.log(
			`Client ${client.getId()} blocked/unblocked ${friendClient.getId()}`,
		);
		client.getSocket().send(
			JSON.stringify({
				block: true,
				relatedId: friendClient.getId(),
				notification: `Block status changed for ${friendClient.getId()}`, // TODO for debugging purposes
			}),
		);
	} catch (error) {
		errorCaught(error, client);
	}
}

function blockStatusHandler(client: Client, friendClient: Client) {
	try {
		const blockStatus = client.isBlocked(friendClient.getId());
		client.getSocket().send(
			JSON.stringify({
				blockStatus: blockStatus,
				relatedId: friendClient.getId(),
				notification: `Block status for ${friendClient.getId()}`, // TODO for debugging purposes
			}),
		);
	} catch (error) {
		errorCaught(error, client);
	}
}

function blockListHandler(client: Client) {
	try {
		const blockList = Array.from(client.getBlockList());
		client.getSocket().send(
			JSON.stringify({
				blockList: blockList,
				notification: `Block list of ${client.getId()}`, // TODO for debugging purposes
			}),
		);
	} catch (error) {
		errorCaught(error, client);
	}
}

function messageHandler(message: string, client: Client, friendClient: Client) {
	try {
		client.getSocket().send(
			JSON.stringify({
				message: message,
				relatedId: client.getId(),
			}),
		);
		if (!friendClient.isBlocked(client.getId())) {
			friendClient.getSocket().send(
				JSON.stringify({
					message: message,
					relatedId: client.getId(),
				}),
			);
		}
	} catch (error) {
		errorCaught(error, client);
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
		else if (data.blockList) return blockListHandler(client);
		if (!data.relatedId) throw new Error("Server: relatedId not found");
		if (data.relatedId === client.getId())
			throw new Error("Server: You cannot send a message to yourself");
		const friendClient = onlineClients.get(data.relatedId);
		if (!friendClient) throw new Error("Server: UUID not found");
		if (data.block) return blockHandler(client, friendClient);
		else if (data.blockStatus)
			return blockStatusHandler(client, friendClient);
		if (client.isBlocked(friendClient.getId()))
			throw new Error("Server: You blocked this UUID");
		if (data.message) messageHandler(data.message, client, friendClient);
		else if (data.invite) inviteHandler(client, friendClient);
		else if (data.inviteAccepted)
			inviteAcceptedHandler(client, friendClient);
		else if (data.socketOpened)
			await socketOpenedHandler(client, friendClient);
		else throw new Error("Server: Unknown request");
	} catch (error) {
		errorCaught(error, client);
	}
}

export function onClientDisconnect(client: Client) {
	console.log(`Client ${client.getId()} disconnected`); // for debugging purposes
	onlineClients.delete(client.getId());
	onlineClients.forEach((person) => {
		person.getSocket().send(
			JSON.stringify({
				clientDisconnected: true,
				relatedId: client.getId(),
			}),
		);
	});
}
