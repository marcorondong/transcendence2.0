import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify'
import fastifyWebsocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
// import chalk from 'chalk';

const PORT = 3002;
const HOST = '0.0.0.0';

const fastify: FastifyInstance = Fastify({ logger: false });
let allClients: Client[] = [];
const chatHistories: Record<string, Record<string, Message[]>> = {};

class Client 
{
	id: string;
    nickname: string;
    socket: WebSocket;
	blockedList: string[] = [];

    constructor(id: string, nickname: string, socket: WebSocket) 
	{
        this.id = id;
		this.socket = socket;
        this.nickname = '';
    }
}

class Message 
{
	text: string;
	isOwn: boolean;

	constructor(text: string, isOwn: boolean) 
	{
		this.text = text;
		this.isOwn = isOwn;
	}
}

function addMessage(sender: string, receiver: string, message: Message) {
    if (!chatHistories[sender]) {
        chatHistories[sender] = {};
    }
    if (!chatHistories[sender][receiver]) {
        chatHistories[sender][receiver] = [];
    }
	if(message.text === '')
	{
		return;
	}
    chatHistories[sender][receiver].push(message);
}

const findClientByNickname = (nickname: string): Client | undefined => {
    for (const client of allClients.values()) {
        if (client.nickname === nickname) {
            return client;
        }
    }
    return undefined;
};

// fastify.register(fastifyStatic, {
// 	root: path.join(__dirname, '../public'),
// 	prefix: '/', // optional: default '/'
// });

fastify.register(fastifyWebsocket);

// fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
// 	return reply.sendFile('index.html');
// });

fastify.register(async function (fastify)
{
	fastify.get('/ws', { websocket: true }, (connection, req) => 
	{
		const socket = connection as unknown as WebSocket;
		const id = uuidv4();
		const currentClient = new Client(id, "", socket);
		// allClients.push(currentClient); // This is done after registration is successful
		// console.log(chalk.magentaBright('Client connected'));

		connection.on('message', (message: string) =>
		{
			const data = JSON.parse(message.toString());
			if(data.microservice)
			{
				if(data.microservice === 'chat')
				{
					if(data.message)
					{
						const receiver = findClientByNickname(data.receiver);
						if(receiver && !receiver.blockedList.includes(currentClient.nickname))
						{
							const message = new Message(data.message, false);
							addMessage(data.receiver, currentClient.nickname, message);
							receiver.socket.send(JSON.stringify({ microservice: 'chat', message: data.message, sender: currentClient.nickname }));
						}
						const message = new Message(data.message, true);
						addMessage(currentClient.nickname, data.receiver, message);
						return;
					}
					else if(data.notification)
					{
						const receiver = findClientByNickname(data.receiver);
						if(receiver && !receiver.blockedList.includes(currentClient.nickname))
						{
							receiver.socket.send(JSON.stringify({ microservice: 'chat', notification: data.notification, sender: currentClient.nickname }));
						}
						return;
					}
					else if(data.chatHistoryRequest)
					{
						if(!chatHistories[currentClient.nickname] || !chatHistories[currentClient.nickname][data.chattingWith])
						{
							const message = new Message('', false);
							addMessage(currentClient.nickname, data.chattingWith, message);
							socket.send(JSON.stringify({ microservice: 'chat', chatHistoryProvided: [], block: false }));
							return;
						}
						const isBlocked = currentClient.blockedList.includes(data.chattingWith);
						const chatHistory = chatHistories[currentClient.nickname][data.chattingWith];
						socket.send(JSON.stringify({ microservice: 'chat', chatHistoryProvided: chatHistory, block: isBlocked }));
						return;
					}
					else if(data.blockThisPerson)
					{
						currentClient.blockedList.push(data.blockThisPerson);
						socket.send(JSON.stringify({ microservice: 'chat', thisPersonBlocked: data.blockThisPerson }));
						return;
					}
					else if(data.unblockThisPerson)
					{
						currentClient.blockedList = currentClient.blockedList.filter(n => n !== data.unblockThisPerson);
						socket.send(JSON.stringify({ microservice: 'chat', thisPersonUnblocked: data.unblockThisPerson }));
						return;
					}
					else if(data.registerThisPerson)
					{
						if(allClients.some(client => client.nickname === data.registerThisPerson))
						{
							socket.send(JSON.stringify({ microservice: 'chat', registrationDeclined: data.registerThisPerson + ' is already taken'}));
							return;
						}
						const clientsOnline = Array.from(allClients.values()).map(client => ({nickname: client.nickname}));
						socket.send(JSON.stringify({ microservice: 'chat', registrationApproved: data.registerThisPerson, clientsOnline: clientsOnline }));
						for(const client of allClients)
						{
							client.socket.send(JSON.stringify({ microservice: 'chat', newClientOnline: data.registerThisPerson }));
						}
						currentClient.nickname = data.registerThisPerson;
						allClients.push(currentClient);
						return;
					}
					else if(data.inviteThisPerson)
					{
						const invitee = findClientByNickname(data.inviteThisPerson);
						if(invitee && !invitee.blockedList.includes(currentClient.nickname))
						{
							const message = new Message(data.message, false);
							addMessage(data.receiver, currentClient.nickname, message);
							invitee.socket.send(JSON.stringify({ microservice: 'chat', thisPersonInvitedYou: currentClient.nickname }));
						}
						return;
					}
					else if(data.invitationCanceled)
					{
						const invitee = findClientByNickname(data.invitationCanceled);
						if(invitee && !invitee.blockedList.includes(currentClient.nickname))
						{
							invitee.socket.send(JSON.stringify({ microservice: 'chat', invitationCanceled: currentClient.nickname }));
						}
						return;
					}
					else if (data.startGame)
					{
						const invitee = findClientByNickname(data.startGame);
						if(invitee && !invitee.blockedList.includes(currentClient.nickname))
						{
							invitee.socket.send(JSON.stringify({ microservice: 'chat', startGame: "http://10.14.5.2:3001/" }));
							socket.send(JSON.stringify({ microservice: 'chat', startGame: "http://10.14.5.2:3001/" }));
						}
						return;
					}
					else if(data.error)
					{
						// console.log(chalk.red('Error: Client sent an error message to "chat" microservice. Something went wrong in client side. The error message is:'));
						// console.log(chalk.yellow(data.error));
						return;
					}
					else // if chat microservice has an unknown request
					{
						// console.log(chalk.red('Error: Unknown request from client in "chat" microservice. Received data:'));
						// console.log(JSON.stringify(data, null, 2));
					}
				}
				else if (data.microservice === 'error')
				{
					if(data.errorMessage && data.sentData)
					{
						// console.log(chalk.red('Error: Client received incorrect data from server. The error message is:'));
						// console.log(chalk.yellow(data.errorMessage));
						// console.log(chalk.red('Data which client received from server:'));
						console.log(JSON.stringify(data.sentData, null, 2));
					}
					else // if errorMessage or sentData property is not found or has a falsy value
					{
						// console.log(chalk.red('Error: "errorMessage" or "sentData" property not found or has a falsy value in data sent by client to server under received "microservice": "error" request in server side. Received data:'));
						console.log(JSON.stringify(data, null, 2));
					}
				}
				else // if microservice property has an unknown value
				{
					// console.log(chalk.red('Error: Unknown "microservice" request from client. This server only supports "chat" and "error" microservice requests. Received data:'));
					console.log(JSON.stringify(data, null, 2));
				}
			}
			else // if microservice property is not found or has a falsy value
			{
				// console.log(chalk.red('Error: "microservice" property not found or has a falsy value in data sent by client to server. Received data:'));
				console.log(JSON.stringify(data, null, 2))
			}
		});

		connection.on('close', (code: number, reason: Buffer) => 
		{
			// console.log(chalk.red(`Client disconnected with code: ${code}, reason: ${reason.toString()}`));
			allClients = allClients.filter(client => client !== currentClient);

			for(const client of allClients)
			{
				client.socket.send(JSON.stringify({ microservice: 'chat', clientDisconnected: true, nickname: currentClient.nickname }));
			}
		});
	});
});

const start = async () => 
{
	try 
	{
		await fastify.listen({ port: PORT, host: HOST })
		const address = fastify.server.address()
		const port = typeof address === 'string' ? address : address?.port
		console.log(`Server listening at ${port}`)

	} 
	catch (err) 
	{
		fastify.log.error(err)
		process.exit(1)
	}
}

start();