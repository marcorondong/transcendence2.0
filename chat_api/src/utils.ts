import { Client } from './Client';
import { Message } from './Message';
import { chatHistories } from './index';
import { allClients } from './index';

export function onClientMessage(message: string, currentClient: Client)
{
	const data = parseJsonMessage(Buffer.from(message), currentClient.getSocket());
	if (!data)
		return;
	if(currentClient.getRegistered() === false)
	{
		if(data.microservice === 'chat' && data.registerThisPerson)
			handleRegisterPerson(data, currentClient);
		else 
		{
			console.log('Error: Client is not registered but send message. Client must register before interacting website. Client may try to send message not throw frondend but else way (ex: Postman). Warning: Possibly port is exposed or hacker attack. Received data:');
			console.log(JSON.stringify(data, null, 2));
			currentClient.getSocket().send(JSON.stringify({ microservice: 'error', errorMessage: 'Error: Client is not registered but send message. Client must register before interacting website. Client may try to send message not throw frondend but else way (ex: Postman). Warning: Possibly port is exposed or hacker attack.', sentData: data }));
			currentClient.getSocket().close();
		}
	}
	else // if client is registered
	{
		if(data.microservice)
		{
			if(data.microservice === 'chat')
				handleChatMicroserviceRequests(data, currentClient);
			else if (data.microservice === 'error')
				handleErrorGeneral(data);
			else // if microservice property has an unknown value
				unknownMicroserviceRequest(data);
		}
		else // if microservice property is not found or has a falsy value
			noMicroservicePropertyFound(data, currentClient);
	}
}

export function onClientDisconnect(currentClient: Client, code: number, reason: Buffer)
{
	if(currentClient.getRegistered() === true)
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

export function parseJsonMessage(message: Buffer, socket: WebSocket): any {
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

export function addMessage(sender: string, receiver: string, message: Message) {
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

export const findClientByNickname = (nickname: string): Client | undefined => {
	for (const client of allClients.values()) {
		if (client.getNickname() === nickname) {
			return client;
		}
	}
	return undefined;
};

export function handleChatMessage(data: any, currentClient: Client) 
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

export function handleNotification(data: any, currentClient: Client) 
{
	const receiver = findClientByNickname(data.receiver);
	if (receiver && !receiver.getBlockedList().includes(currentClient.getNickname())) {
		receiver.getSocket().send(JSON.stringify({ microservice: 'chat', notification: data.notification, sender: currentClient.getNickname() }));
	}
}

export function handleChatHistoryRequest(data: any, currentClient: Client)
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

export function handleBlockPerson(data: any, currentClient: Client)
{
	currentClient.getBlockedList().push(data.blockThisPerson);
	currentClient.getSocket().send(JSON.stringify({ microservice: 'chat', thisPersonBlocked: data.blockThisPerson }));
}

export function handleUnblockPerson(data: any, currentClient: Client)
{
	currentClient.setBlockedList(currentClient.getBlockedList().filter(n => n !== data.unblockThisPerson));
	currentClient.getSocket().send(JSON.stringify({ microservice: 'chat', thisPersonUnblocked: data.unblockThisPerson }));
}

export function handleRegisterPerson(data: any, currentClient: Client)
{
	if(allClients.some(client => client.getNickname() === data.registerThisPerson))
	{
		currentClient.getSocket().send(JSON.stringify({ microservice: 'chat', registrationDeclined: data.registerThisPerson + ' is already taken'}));
		return;
	}
	const clientsOnline = Array.from(allClients.values()).map(client => ({nickname: client.getNickname()}));
	currentClient.getSocket().send(JSON.stringify({ microservice: 'chat', registrationApproved: data.registerThisPerson, clientsOnline: clientsOnline }));
	for(const client of allClients)
	{
		client.getSocket().send(JSON.stringify({ microservice: 'chat', newClientOnline: data.registerThisPerson }));
	}
	currentClient.setNickname(data.registerThisPerson);
	allClients.push(currentClient);
	currentClient.setRegistered(true);
}

export function handleInvitePerson(data: any, currentClient: Client)
{
	const invitee = findClientByNickname(data.inviteThisPerson);
	if(invitee && !invitee.getBlockedList().includes(currentClient.getNickname()))
	{
		const message = new Message(data.message, false);
		addMessage(data.receiver, currentClient.getNickname(), message);
		invitee.getSocket().send(JSON.stringify({ microservice: 'chat', thisPersonInvitedYou: currentClient.getNickname() }));
	}
}

export function handleCancelInvitation(data: any, currentClient: Client)
{
	const invitee = findClientByNickname(data.cancelInvitation);
	if(invitee && !invitee.getBlockedList().includes(currentClient.getNickname()))
	{
		invitee.getSocket().send(JSON.stringify({ microservice: 'chat', invitationCanceled: currentClient.getNickname() }));
	}
}

export function handleStartGame(data: any, currentClient: Client)
{
	const invitee = findClientByNickname(data.startGame);
	if(invitee && !invitee.getBlockedList().includes(currentClient.getNickname()))
	{
		invitee.getSocket().send(JSON.stringify({ microservice: 'chat', startGame: "http://10.14.5.2:3001/"}));
	}
}

export function handleErrorInChat(data: any)
{
		console.log('Error: Client sent an error message to "chat" microservice. Client received incorrect data from server. The error message is:');
		console.log(data.error);
}

export function handleErrorGeneral(data: any)
{
	if(data.errorMessage && data.sentData)
		{
			console.log('Error: Client received incorrect data from server. The error message is:');
			console.log(data.errorMessage);
			console.log('Data which client received from server:');
			console.log(JSON.stringify(data.sentData, null, 2));
		}
		else // if errorMessage or sentData property is not found or has a falsy value
		{
			console.log('Error: "errorMessage" or "sentData" property not found or has a falsy value in data sent by client to server under received "microservice": "error" request in server side. Received data:');
			console.log(JSON.stringify(data, null, 2));
		}
}

export function handleChatMicroserviceRequests(data: any, currentClient: Client)
{
	if(data.registerThisPerson && currentClient.getRegistered() === true)
	{
		currentClient.getSocket().send(JSON.stringify({ microservice: 'chat', registrationDeclined: 'You are already registered as ' + currentClient.getNickname() }));
		console.log('Error: Client is already registered but trying to register again. Received data:');
		console.log(JSON.stringify(data, null, 2));
		currentClient.getSocket().close();
	}
	else if(data.message && data.receiver && data.receiver !== currentClient.getNickname() && currentClient.getNickname())
		handleChatMessage(data, currentClient);
	else if(data.notification)
		handleNotification(data, currentClient);
	else if(data.chatHistoryRequest)
		handleChatHistoryRequest(data, currentClient);
	else if(data.blockThisPerson)
		handleBlockPerson(data, currentClient);
	else if(data.unblockThisPerson)
		handleUnblockPerson(data, currentClient);
	else if(data.inviteThisPerson)
		handleInvitePerson(data, currentClient);
	else if(data.invitationCanceled)
		handleCancelInvitation(data, currentClient);
	else if (data.startGame)
		handleStartGame(data, currentClient);
	else if(data.error)
		handleErrorInChat(data);
	else // if chat microservice has an unknown request
	{
		console.log('Error: Unknown request from client in "chat" microservice. Received data:');
		console.log(JSON.stringify(data, null, 2));
	}
}

export function unknownMicroserviceRequest(data: any)
{
	console.log('Error: Unknown "microservice" request from client. This server only supports "chat" and "error" microservice requests. Received data:');
	console.log(JSON.stringify(data, null, 2));
}

export function noMicroservicePropertyFound(data: any, currentClient: Client)
{
		console.log('Error: "microservice" property not found or has a falsy value in data sent by client to server. Received data:');
		console.log(JSON.stringify(data, null, 2));
}

