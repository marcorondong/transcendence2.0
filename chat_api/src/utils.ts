import { liveClients } from "./index";
import { Client } from "./Client";
import { Message } from "./Message";
import { addMessageToDatabase, checkBlockStatusInDB } from "./utils/dbUtils";

function parseJsonMessage(message: Buffer, socket: WebSocket | null) {
	let data;
	try {
		return JSON.parse(message.toString());
	} catch (error) {
		console.error("Hey Error:", error);
		return null;
		// socket.close();
	}
}

async function messageHandler(message: string, sender: string, receiver: string, client: Client) 
{
	const isFriend = client.isUserFriend(receiver);
	const isInBlockList = client.isUserBlocked(receiver);
	const socket = client.getSocket();
	if (!socket) {
		console.log('Socket not found');
		return;
	}
	if (isInBlockList) {
		socket.send(JSON.stringify({ message: "You have blocked this user. You can not send message to this user" }));
		return;
	}
	if(!isFriend)
	{
		client.getSocket()?.send(JSON.stringify({ message: "You are not friends with this user" }));
		return;
	}
	let isClientBlocked = false;
	const receiverClient = liveClients.get(receiver);

	if(receiverClient)
	{
		isClientBlocked = receiverClient.isUserBlocked(sender);
	}else
	{
		isClientBlocked = await checkBlockStatusInDB(receiver, sender);
	}

	addMessageToDatabase(sender, receiver, message, isClientBlocked);
	client.addToChatHistory(receiver, new Message(message, sender));
	socket.send(JSON.stringify({ message: message, sender: sender }));
	if(receiverClient && !isClientBlocked)
	{
		receiverClient.addToChatHistory(sender, new Message(message, sender));
		receiverClient.getSocket()?.send(JSON.stringify({ message: message, sender: sender }));

	}
}

export function onClientMessage(message: string, client: Client): void
{
	const data = parseJsonMessage(Buffer.from(message), client.getSocket());
	if (!data)
		return;
	const userName = client.getUserName();
	if(data.message && data.sender && data.receiver && data.sender === userName && data.receiver !== userName)
	{
		messageHandler(data.message, data.sender, data.receiver, client);
	}
	else
	{
		client.getSocket()?.send(JSON.stringify({ message: "Something went wrong" }));
	}
	console.log(`Received message from ${userName}: ${message}`);
}

export function onClientDisconnect(code: number, reason: Buffer, client: Client): void
{
	// should I remove the client from memory?
	try {
		const userName = client.getUserName();

		if (!liveClients.has(userName)) {
			console.log("Warning: Client not found in live clients");
		}
		else
		{
			liveClients.delete(userName);
			console.log("Client removed from memory:", userName);
		}

		// client.getSocket()?.close(code, reason.toString());
		console.log(`Client disconnected: ${userName}, Code: ${code}, Reason: ${reason.toString()}`);
	}
	catch (error) {
		console.error("Error removing client from memory:", error);
	}
}

