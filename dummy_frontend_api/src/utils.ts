import { Client } from './Client';

let allClients: Client[] = [];

export function onClientMessage(message: string, currentClient: Client): void
{
	const data = parseJsonMessage(Buffer.from(message), currentClient.getSocket());
	if (!data)
		return;
	if(currentClient.getRegistered() === false)
	{
		if(data.microservice === 'frontend' && data.registerThisPerson)
			handleRegisterPerson(data, currentClient);
		else 
		{
			console.log('Error: Client is not registered but send message. Client must register before interacting website. Client may try to send message not throw frondend but else way (ex: Postman). Warning: Possibly port is exposed or hacker attack. Received data:');
			console.log(JSON.stringify(data, null, 2));
			currentClient.getSocket().send(JSON.stringify({ microservice: 'error', errorMessage: 'Error: Client is not registered but send message. Client must register before interacting website. Client may try to send message not throw frondend but else way (ex: Postman). Warning: Possibly port is exposed or hacker attack.', sentData: data }));
			currentClient.getSocket().close();
		}
	}
}

export function onClientDisconnect(code: number, reason: Buffer, currentClient: Client): void
{
	if(currentClient.getRegistered() === true)
	{
		console.log(`Client disconnected with code: ${code}, reason: ${reason.toString()}`);
		const updatedClients = allClients.filter(client => client !== currentClient);
		allClients.length = 0;
		allClients.push(...updatedClients);
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

export function handleRegisterPerson(data: any, currentClient: Client)
{
	if(allClients.some(client => client.getNickname() === data.registerThisPerson))
	{
		currentClient.getSocket().send(JSON.stringify({ microservice: 'frontend', registrationDeclined: data.registerThisPerson + ' is already taken'}));
		return;
	}
	const clientsOnline = Array.from(allClients.values()).map(client => ({nickname: client.getNickname()}));
	currentClient.getSocket().send(JSON.stringify({ microservice: 'frontend', registrationApproved: data.registerThisPerson, clientsOnline: clientsOnline}));
	currentClient.setNickname(data.registerThisPerson);
	currentClient.setRegistered(true);
	allClients.push(currentClient);
}