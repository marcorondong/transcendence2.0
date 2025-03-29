import { Client } from './Client';

let allClients: Client[] = [];
let lookingForGame_nickname: string = '';

export function onClientMessage(message: string, currentClient: Client): void
{
	const data = parseJsonMessage(Buffer.from(message), currentClient.getSocket());
	if(!data)
		return;
	handleTicTacToeMicroserviceRequests(data, currentClient);
}

export function onClientDisconnect(code: number, reason: Buffer, currentClient: Client): void
{
	if(currentClient.getRegistration() === true)
	{
		if(currentClient.getNickname() === lookingForGame_nickname)
		{
			lookingForGame_nickname = '';
		}
		console.log(`Client disconnected with code: ${code}, reason: ${reason.toString()}`);
		const updatedClients = allClients.filter(client => client !== currentClient);
		allClients.length = 0;
		allClients.push(...updatedClients);
		currentClient.getFriendSocket()?.send(JSON.stringify({ microservice: 'tictactoe', friendDisconnected: true }));
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

export const findClientByNickname = (nickname: string): Client | undefined => {
	for (const client of allClients.values()) {
		if (client.getNickname() === nickname) {
			return client;
		}
	}
	return undefined;
};

export function handleRegisterPerson(data: any, currentClient: Client): void
{
	currentClient.getSocket().send(JSON.stringify({ microservice: 'tictactoe', registrationApproved: data.registerThisPerson}));
	currentClient.setNickname(data.registerThisPerson);
	currentClient.setRegistration(true);
	allClients.push(currentClient);
}

export function handleLookingForGame(data: any, currentClient: Client): void
{
	if(lookingForGame_nickname !== '')
	{
		const friendClient = allClients.find(client => client.getNickname() === lookingForGame_nickname);
		if(friendClient)
		{
			currentClient.setFriendSocket(friendClient.getSocket());
			friendClient.setFriendSocket(currentClient.getSocket());
			
			const player1Symbol = Math.random() < 0.5 ? 'X' : 'O';
			const player2Symbol = player1Symbol === 'X' ? 'O' : 'X';

			currentClient.getSocket().send(JSON.stringify({ microservice: 'tictactoe', startGame: true, friendNickname: friendClient.getNickname(), yourSymbol: player1Symbol }));
			friendClient.getSocket().send(JSON.stringify({ microservice: 'tictactoe', startGame: true, friendNickname: currentClient.getNickname(), yourSymbol: player2Symbol }));

			lookingForGame_nickname = '';

		}
		else
		{
			console.log('Client not found. Check the code, something may get wrong or Client may have disconnected.');
		}
	}
	else
	{
		lookingForGame_nickname = currentClient.getNickname();
	}
}

export function handleTicTacToeMicroserviceRequests(data: any, currentClient: Client): void
{
	if(data.registerThisPerson)
		handleRegisterPerson(data, currentClient);
	else if(data.lookingForGame)
		handleLookingForGame(data, currentClient);
	else if(data.cancelLookingForGame)
		lookingForGame_nickname = '';
	else
		currentClient.getFriendSocket()?.send(JSON.stringify(data));
}
