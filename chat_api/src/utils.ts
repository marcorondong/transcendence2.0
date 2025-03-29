import { Client } from './Client';
import { Message } from './Message';

let allClients: Client[] = [];
const chatHistories: Record<string, Record<string, Message[]>> = {};

export function onClientMessage(message: string, currentClient: Client): void
{
	const data = parseJsonMessage(Buffer.from(message), currentClient.getSocket());
	if (!data)
		return;
	handleChatMicroserviceRequests(data, currentClient);
}

export function onClientDisconnect(code: number, reason: Buffer, currentClient: Client)
{
	if(currentClient.getRegistration() === true)
	{
		console.log(`Client disconnected with code: ${code}, reason: ${reason.toString()}`);
		const updatedClients = allClients.filter(client => client !== currentClient);
		allClients.length = 0;
		allClients.push(...updatedClients);

		for(const client of allClients)
		{
			client.getSocket().send(JSON.stringify({ microservice: 'chat', clientDisconnected: true, nickname: currentClient.getNickname() }));
		}
	}
	else // if client is not registered
	{
		console.log(`Client disconnected without registaring with code: ${code}, reason: ${reason.toString()}`);
		console.log('Client may have used Postman or other tools to send message to server. Warning: Possibly port is exposed or hacker attack.');
	}
}

function parseJsonMessage(message: Buffer, socket: WebSocket): any {
	let data;
	try {
		data = JSON.parse(message.toString());
	} catch (error) {
		console.error("Hey Error:", error);
		console.log('Error: Client sent an invalid JSON string to server. Sent data:');
		console.log(message.toString());
		socket.send(JSON.stringify({ microservice: 'error', errorMessage: 'Error: Client sent an invalid JSON string to server. Please send a valid JSON string.', sentData: message.toString() }));
		data = null; // or handle the error as needed
		socket.close();
	}
	return data;
}

function addMessage(sender: string, receiver: string, message: Message) {
	if (!chatHistories[sender]) {
		chatHistories[sender] = {};
	}
	if (!chatHistories[sender][receiver]) {
		chatHistories[sender][receiver] = [];
	}
	if(message.getText() === '')
	{
		return;
	}
	chatHistories[sender][receiver].push(message);
}

const findClientByNickname = (nickname: string): Client | undefined => {
	for (const client of allClients.values()) {
		if (client.getNickname() === nickname) {
			return client;
		}
	}
	return undefined;
};

function messageHandler(data: any, currentClient: Client) 
{
	const receiver = findClientByNickname(data.receiver);
	if (receiver && !receiver.getBlockedList().includes(currentClient.getNickname())) {
		const message = new Message(data.message, false);
		addMessage(data.receiver, currentClient.getNickname(), message);
		receiver.getSocket().send(JSON.stringify({ microservice: 'chat', message: data.message, sender: currentClient.getNickname() }));
	}
	const message = new Message(data.message, true);
	addMessage(currentClient.getNickname(), data.receiver, message);
}

function notificationHandler(data: any, currentClient: Client) 
{
	const receiver = findClientByNickname(data.receiver);
	if (receiver && !receiver.getBlockedList().includes(currentClient.getNickname())) {
		receiver.getSocket().send(JSON.stringify({ microservice: 'chat', notification: data.notification, sender: currentClient.getNickname() }));
	}
}

function historyHandler(data: any, currentClient: Client)
{
	if(!chatHistories[currentClient.getNickname()] || !chatHistories[currentClient.getNickname()][data.chattingWith])
	{
		const message = new Message('', false);
		addMessage(currentClient.getNickname(), data.chattingWith, message);
		currentClient.getSocket().send(JSON.stringify({ microservice: 'chat', chatHistoryProvided: [] }));
		return;
	}
	const isBlocked = currentClient.getBlockedList().includes(data.chattingWith);
	const chatHistory = chatHistories[currentClient.getNickname()][data.chattingWith];
	currentClient.getSocket().send(JSON.stringify({ microservice: 'chat', chatHistoryProvided: chatHistory, block: isBlocked }));
}

function blockingHandler(data: any, currentClient: Client)
{
	currentClient.getBlockedList().push(data.blockThisPerson);
	currentClient.getSocket().send(JSON.stringify({ microservice: 'chat', thisPersonBlocked: data.blockThisPerson }));
}

function unblockingHandler(data: any, currentClient: Client)
{
	currentClient.setBlockedList(currentClient.getBlockedList().filter(n => n !== data.unblockThisPerson));
	currentClient.getSocket().send(JSON.stringify({ microservice: 'chat', thisPersonUnblocked: data.unblockThisPerson }));
}

function registrationHandler(data: any, currentClient: Client)
{
	const clientsOnline = Array.from(allClients.values()).map(client => ({nickname: client.getNickname()}));
	currentClient.getSocket().send(JSON.stringify({ microservice: 'chat', registrationApproved: data.registerThisPerson, clientsOnline: clientsOnline }));
	for(const client of allClients)
	{
		client.getSocket().send(JSON.stringify({ microservice: 'chat', newClientOnline: data.registerThisPerson }));
	}
	currentClient.setNickname(data.registerThisPerson);
	currentClient.setRegistration(true);
	allClients.push(currentClient);
}

function invitationHandler(data: any, currentClient: Client)
{
	const invitee = findClientByNickname(data.inviteThisPerson);
	if(invitee && !invitee.getBlockedList().includes(currentClient.getNickname()))
	{
		const message = new Message(data.message, false);
		addMessage(data.receiver, currentClient.getNickname(), message);
		invitee.getSocket().send(JSON.stringify({ microservice: 'chat', thisPersonInvitedYou: currentClient.getNickname() }));
	}
}

function cancelInvitationHandler(data: any, currentClient: Client)
{
	const invitee = findClientByNickname(data.cancelInvitation);
	if(invitee && !invitee.getBlockedList().includes(currentClient.getNickname()))
	{
		invitee.getSocket().send(JSON.stringify({ microservice: 'chat', invitationCanceled: currentClient.getNickname() }));
	}
}

function handleStartGame(data: any, currentClient: Client)
{
	const invitee = findClientByNickname(data.startGame);
	if(invitee && !invitee.getBlockedList().includes(currentClient.getNickname()))
	{
		invitee.getSocket().send(JSON.stringify({ microservice: 'chat', startGame: "http://10.14.5.2:3001/"}));
	}
}

function errorHandler(data: any)
{
		console.log('Error: Client sent an error message to "chat" microservice. Client received incorrect data from server. The error message is:');
		console.log(data.error);
}

function handleChatMicroserviceRequests(data: any, currentClient: Client)
{
	if(data.registerThisPerson)
		registrationHandler(data, currentClient);
	else if(data.message && data.receiver && data.receiver !== currentClient.getNickname() && currentClient.getNickname())
		messageHandler(data, currentClient);
	else if(data.notification)
		notificationHandler(data, currentClient);
	else if(data.chatHistoryRequest)
		historyHandler(data, currentClient);
	else if(data.blockThisPerson)
		blockingHandler(data, currentClient);
	else if(data.unblockThisPerson)
		unblockingHandler(data, currentClient);
	else if(data.inviteThisPerson)
		invitationHandler(data, currentClient);
	else if(data.invitationCanceled)
		cancelInvitationHandler(data, currentClient);
	else if (data.startGame)
		handleStartGame(data, currentClient);
	else if(data.error)
		errorHandler(data);
	else // if chat microservice has an unknown request
	{
		console.log('Error: Unknown request from client in "chat" microservice. Received data:');
		console.log(JSON.stringify(data, null, 2));
	}
}

