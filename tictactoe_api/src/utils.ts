// import { Client } from './Client';

// let allClients: Client[] = [];
// let lookingForGame_nickname: string = '';

// export function onClientMessage(message: string, currentClient: Client): void
// {
// 	const data = parseJsonMessage(Buffer.from(message), currentClient.getSocket());
// 	if(!data)
// 		return;
// 	// if(currentClient.getRegistered() === false)
// 	// {
// 	// 	if(data.microservice === 'tictactoe' && data.registerThisPerson)
// 	// 		handleRegisterPerson(data, currentClient);
// 	// 	else 
// 	// 	{
// 	// 		console.log('Error: Client is not registered but send message. Client must register before interacting website. Client may try to send message not throw frondend but else way (ex: Postman). Warning: Possibly port is exposed or hacker attack. Received data:');
// 	// 		console.log(JSON.stringify(data, null, 2));
// 	// 		currentClient.getSocket().send(JSON.stringify({ microservice: 'error', errorMessage: 'Error: Client is not registered but send message. Client must register before interacting website. Client may try to send message not throw frondend but else way (ex: Postman). Warning: Possibly port is exposed or hacker attack.', sentData: data }));
// 	// 		currentClient.getSocket().close();
// 	// 	}
// 	// }
// 	// else // Client is registered
// 	// {
// 		if(data.microservice)
// 		{
// 			if(data.microservice === 'tictactoe')
// 				handleTicTacToeMicroserviceRequests(data, currentClient);
// 			else if(data.microservice === 'error')
// 				handleErrorGeneral(data, currentClient);
// 			else
// 				unknownMicroserviceRequest(data, currentClient);
// 		}
// 		else
// 			noMicroservicePropertyFound(data, currentClient);
// 	// }
// }

// export function onClientDisconnect(code: number, reason: Buffer, currentClient: Client): void
// {
// 	if(currentClient.getId() === lookingForGame_nickname)
// 	{
// 		lookingForGame_nickname = '';
// 	}
// 	console.log(`Client disconnected with code: ${code}, reason: ${reason.toString()}`);
// 	const updatedClients = allClients.filter(client => client !== currentClient);
// 	allClients.length = 0;
// 	allClients.push(...updatedClients);
// 	currentClient.getFriendSocket()?.send(JSON.stringify({ microservice: 'tictactoe', friendDisconnected: true }));
// }

// export function parseJsonMessage(message: Buffer, socket: WebSocket): any {
// 	let data;
// 	try {
// 		data = JSON.parse(message.toString());
// 	} catch (error) {
// 		console.error("Hey Error:", error);
// 		console.log('Error: Client sent an invalid JSON string to server. Sent data:');
// 		console.log(message.toString());
// 		socket.send(JSON.stringify({ microservice: 'error', errorMessage: 'Error: Client sent an invalid JSON string to server. Please send a valid JSON string.', sentData: message.toString() }));
// 		data = null; // or handle the error as needed
// 		socket.close();
// 	}
// 	return data;
// }

// export const findClientByNickname = (nickname: string): Client | undefined => {
// 	for (const client of allClients.values()) {
// 		if (client.getId() === nickname) {
// 			return client;
// 		}
// 	}
// 	return undefined;
// };

// export function handleLookingForGame(data: any, currentClient: Client): void
// {
// 	if(lookingForGame_nickname !== '')
// 	{
// 		const friendClient = allClients.find(client => client.getId() === lookingForGame_nickname);
// 		if(friendClient)
// 		{
// 			currentClient.setFriendSocket(friendClient.getSocket());
// 			friendClient.setFriendSocket(currentClient.getSocket());
			
// 			const player1Symbol = Math.random() < 0.5 ? 'X' : 'O';
// 			const player2Symbol = player1Symbol === 'X' ? 'O' : 'X';

// 			currentClient.getSocket().send(JSON.stringify({ microservice: 'tictactoe', startGame: true, friendNickname: friendClient.getId(), yourSymbol: player1Symbol }));
// 			friendClient.getSocket().send(JSON.stringify({ microservice: 'tictactoe', startGame: true, friendNickname: currentClient.getId(), yourSymbol: player2Symbol }));

// 			lookingForGame_nickname = '';

// 		}
// 		else
// 		{
// 			console.log('Client not found. Check the code, something may get wrong or Client may have disconnected.');
// 		}
// 	}
// 	else
// 	{
// 		lookingForGame_nickname = currentClient.getId();
// 	}
// }

// export function handleErrorGeneral(data: any, currentClient: Client): void
// {
// 	if(data.errorMessage && data.sentData)
// 	{
// 		console.log('Error: Client received incorrect data from server. The error message is:');
// 		console.log(data.errorMessage);
// 		console.log('Data which client received from server:');
// 		console.log(JSON.stringify(data.sentData, null, 2));
// 	}
// 	else // if errorMessage or sentData property is not found or has a falsy value
// 	{
// 		console.log('Error: "errorMessage" or "sentData" property not found or has a falsy value in data sent by client to server under received "microservice": "error" request in server side. Received data:');
// 		console.log(JSON.stringify(data, null, 2));
// 	}
// }

// export function unknownMicroserviceRequest(data: any, currentClient: Client): void
// {
// 	console.log('Error: Unknown "microservice" request from client. This server only supports "tictactoe" and "error" microservice requests. Received data:');
// 	console.log(JSON.stringify(data, null, 2));
// 	currentClient.getSocket().send(JSON.stringify({ microservice: 'error', errorMessage: 'Error: Unknown "microservice" request from client. This server only supports "chat" and "error" microservice requests.', sentData: data }));
// }

// export function noMicroservicePropertyFound(data: any, currentClient: Client): void
// {
// 	console.log('Error: "microservice" property not found in data sent by client to server. Received data:');
// 	console.log(JSON.stringify(data, null, 2));
// 	currentClient.getSocket().send(JSON.stringify({ microservice: 'error', errorMessage: 'Error: "microservice" property not found in data sent by client to server.', sentData: data }));
// }

// export function handleTicTacToeMicroserviceRequests(data: any, currentClient: Client): void
// {
// 	// if(data.registerThisPerson && currentClient.getRegistered() === true)
// 	// {
// 	// 	currentClient.getSocket().send(JSON.stringify({ microservice: 'chat', registrationDeclined: 'You are already registered as ' + currentClient.getId() }));
// 	// 	console.log('Error: Client is already registered but trying to register again. Received data:');
// 	// 	console.log(JSON.stringify(data, null, 2));
// 	// 	currentClient.getSocket().close();
// 	// }
// 	if(data.lookingForGame)
// 		handleLookingForGame(data, currentClient);
// 	else if(data.cancelLookingForGame)
// 		lookingForGame_nickname = '';
// 	else
// 		currentClient.getFriendSocket()?.send(JSON.stringify(data));
// }
