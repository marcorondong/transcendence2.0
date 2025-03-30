import { Client } from './Client';
import { Message } from './Message';
import os from 'os';

let allClients: Client[] = [];
const chatHistories: Record<string, Record<string, Message[]>> = {};

function parseJsonMessage(message: Buffer, socket: WebSocket){
	let data;
	try {
		return JSON.parse(message.toString());
	} catch (error) {
		console.error("Hey Error:", error);
		return null;
		// socket.close();
	}
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

function messageHandler(message: string, receiver: string, currentClient: Client) 
{
	const receiverClient = findClientByNickname(receiver);
	if (receiverClient && !receiverClient.getBlockedList().includes(currentClient.getNickname())) {
		const newMessage = new Message(message, false);
		addMessage(receiver, currentClient.getNickname(), newMessage);
		receiverClient.getSocket().send(JSON.stringify({ message: message, sender: currentClient.getNickname() }));
	}
	const newMessage = new Message(message, true);
	addMessage(currentClient.getNickname(), receiver, newMessage);
}

function notificationHandler(notification: string, receiver: string, currentClient: Client) 
{
	const receiverClient = findClientByNickname(receiver);
	if (receiverClient && !receiverClient.getBlockedList().includes(currentClient.getNickname())) {
		receiverClient.getSocket().send(JSON.stringify({ notification: notification, sender: currentClient.getNickname() }));
	}
}

function historyHandler(person: string, currentClient: Client)
{
	if(!chatHistories[currentClient.getNickname()] || !chatHistories[currentClient.getNickname()][person])
	{
		const message = new Message('', false);
		addMessage(currentClient.getNickname(), person, message);
		currentClient.getSocket().send(JSON.stringify({ chatHistoryProvided: [] }));
		return;
	}
	const isBlocked = currentClient.getBlockedList().includes(person);
	const chatHistory = chatHistories[currentClient.getNickname()][person];
	currentClient.getSocket().send(JSON.stringify({ chatHistoryProvided: chatHistory, block: isBlocked }));
}

function blockingHandler(person: string, currentClient: Client)
{
	currentClient.getBlockedList().push(person);
	currentClient.getSocket().send(JSON.stringify({ thisPersonBlocked: person }));
}

function unblockingHandler(person: string, currentClient: Client)
{
	currentClient.setBlockedList(currentClient.getBlockedList().filter(n => n !== person));
	currentClient.getSocket().send(JSON.stringify({ thisPersonUnblocked: person }));
}

function registrationHandler(person: string, currentClient: Client)
{
	const clientsOnline = Array.from(allClients.values()).map(client => ({nickname: client.getNickname()}));
	currentClient.getSocket().send(JSON.stringify({ registrationApproved: person, clientsOnline: clientsOnline }));
	for(const client of allClients)
	{
		client.getSocket().send(JSON.stringify({ newClientOnline: person }));
	}
	currentClient.setNickname(person);
	currentClient.setRegistration(true);
	allClients.push(currentClient);
}

function invitationHandler(person: string, currentClient: Client)
{
	const invitee = findClientByNickname(person);
	if(invitee && !invitee.getBlockedList().includes(currentClient.getNickname()))
	{
		invitee.getSocket().send(JSON.stringify({ thisPersonInvitedYou: currentClient.getNickname() }));
	}
}

function cancelInvitationHandler(person: string, currentClient: Client)
{
	const invitee = findClientByNickname(person);
	if(invitee && !invitee.getBlockedList().includes(currentClient.getNickname()))
	{
		invitee.getSocket().send(JSON.stringify({ invitationCanceled: currentClient.getNickname() }));
	}
}

function startGame(person: string, currentClient: Client) {
    const invitee = findClientByNickname(person);

    if (invitee && !invitee.getBlockedList().includes(currentClient.getNickname())) {
        invitee.getSocket().send(JSON.stringify({ startGame: "yes"}));
        currentClient.getSocket().send(JSON.stringify({ startGame: "yes"}));
    }
}

export function onClientMessage(message: string, currentClient: Client): void
{
	const data = parseJsonMessage(Buffer.from(message), currentClient.getSocket());
	if (!data)
		return;
	if(data.registerThisPerson)
		registrationHandler(data.registerThisPerson, currentClient);
	else if(data.message && data.receiver && currentClient.getNickname() && data.receiver !== currentClient.getNickname())
		messageHandler(data.message, data.receiver , currentClient);
	else if(data.notification && data.receiver && currentClient.getNickname() && data.receiver !== currentClient.getNickname())
		notificationHandler(data.notification, data.receiver , currentClient);
	else if(data.chatHistoryRequest)
		historyHandler(data.chatHistoryRequest, currentClient);
	else if(data.blockThisPerson)
		blockingHandler(data.blockThisPerson, currentClient);
	else if(data.unblockThisPerson)
		unblockingHandler(data.unblockThisPerson, currentClient);
	else if(data.inviteThisPerson)
		invitationHandler(data.inviteThisPerson, currentClient);
	else if(data.invitationCanceled)
		cancelInvitationHandler(data.invitationCanceled, currentClient);
	else if (data.startGame)
		startGame(data.startGame, currentClient);
	else // if chat microservice has an unknown request
	{
		console.log('Error: Unknown request from client in "chat" microservice. Received data:');
		console.log(JSON.stringify(data, null, 2));
	}
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
			client.getSocket().send(JSON.stringify({ clientDisconnected: true, nickname: currentClient.getNickname() }));
		}
	}
	else // if client is not registered
	{
		console.log(`Client disconnected without registaring with code: ${code}, reason: ${reason.toString()}`);
		console.log('Client may have used Postman or other tools to send message to server. Warning: Possibly port is exposed or hacker attack.');
	}
}

