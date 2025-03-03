import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify'
import fastifyWebsocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

const PORT = 3000;
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
    chatHistories[sender][receiver].push(message);
}

function sendToAllClients(data: any, socket: WebSocket): void 
{
	for (const otherClients of allClients.values())
	{
		if(data.peopleOnline === false && otherClients.socket !== socket)
		{
			otherClients.socket.send(JSON.stringify({ peopleOnline: false, nickname: data.nickname }));
		}
		else if(otherClients.socket !== socket && otherClients.nickname !== '')
		{
			otherClients.socket.send(JSON.stringify({ peopleOnline: true, nickname: data.nickname }));
		}
	}
}

function receiveFromAllClients(data: any, socket: WebSocket): void
{
	for (const otherClients of allClients.values())
	{
		if(otherClients.socket !== socket && otherClients.nickname !== '')
		{
			socket.send(JSON.stringify({ peopleOnline: true, nickname: otherClients.nickname }));
		}
	}
}

const findClientByNickname = (nickname: string): Client | undefined => {
    for (const client of allClients.values()) {
		// console.log('client.nickname: ' + client.nickname);
        if (client.nickname === nickname) {
            return client;
        }
    }
    return undefined;
};

const findKeyByValue = (map: Map<string, Client>, value: Client): string | undefined => {
    for (const [key, val] of map.entries()) {
        if (val === value) {
            return key;
        }
    }
    return undefined;
};

// const nicknameExists = (nickname: string): boolean => {
// 	let users = readData();
// 	return users.find((u: { nickname: string }) => u.nickname === nickname);
// };

function sendAllClients() {
    const clientsOnline = Array.from(allClients.values()).map(client => ({
        nickname: client.nickname
    }));

	const message = JSON.stringify({ microservice: 'chat', updatePeopleOnline: true, clientsOnline: clientsOnline });
    allClients.forEach(client => {
        client.socket.send(message);
    });
}

fastify.register(fastifyStatic, {
	root: path.join(__dirname, '../public'),
	prefix: '/', // optional: default '/'
});

fastify.register(fastifyWebsocket);

fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
	return reply.sendFile('chat.html');
});

fastify.register(async function (fastify)
{
	fastify.get('/ws', { websocket: true }, (connection, req) => 
	{
		const socket = connection as unknown as WebSocket;
		const id = uuidv4();
		const currentClient = new Client(id, "", socket);
		// allClients.push(client);
		console.log(chalk.magentaBright('Client connected'));

		connection.on('message', (message: string) =>
		{
			const data = JSON.parse(message.toString());
			if(data.microservice === 'chat')
			{
				if(data.registration)
				{
					if(allClients.some(client => client.nickname === data.nickname))
					{
						data.registration = false;
						socket.send(JSON.stringify(data));
						return;
					}
					const clientsOnline = Array.from(allClients.values()).map(client => ({
						nickname: client.nickname
					}));
					socket.send(JSON.stringify({ ...data, clientsOnline: clientsOnline }));
					allClients.forEach(client => {
						client.socket.send(JSON.stringify({ microservice: 'chat', newClientOnline: true, nickname: data.nickname }));
					});
					currentClient.nickname = data.nickname;
					allClients.push(currentClient);
					return;
				}
				if(data.chatHistoryRequest)
				{
					if(!chatHistories[data.nickname] || !chatHistories[data.nickname][data.chattingWith])
					{
						socket.send(JSON.stringify({ ...data, chatHistory: []}));
						return;
					}
					const chatHistory = chatHistories[data.nickname][data.chattingWith];
					socket.send(JSON.stringify({ ...data, chatHistory: chatHistory}));
					return;
				}
				if(data.message)
				{
					const receiver = findClientByNickname(data.receiver);
					if(receiver && !receiver.blockedList.includes(data.sender))
					{
						const message = new Message(data.message, false);
						addMessage(data.receiver, data.sender, message);
						receiver.socket.send(JSON.stringify(data));
					}
					const message = new Message(data.message, true);
					addMessage(data.sender, data.receiver, message);
					return;
				}
				if(data.block)
				{
					currentClient.blockedList.push(data.blockedPerson);
					return;
				}
				if(data.unblock)
				{
					currentClient.blockedList = currentClient.blockedList.filter(n => n !== data.unblockedPerson);
					return;
				}
				// if(data.peopleOnline)
				// {
				// 	sendToAllClients(data, socket);
				// 	return;
				// }
				// if(data.peopleOnline === false)
				// {
				// 	sendToAllClients(data, socket);
				// 	return;
				// }
				// if(data.receiveFromAllClients)
				// {
				// 	receiveFromAllClients(data, socket);
				// 	return;
				// }
			};
		});

		connection.on('close', (code: number, reason: Buffer) => 
		{
			// client.friendSocket && allClients.get(client.friendSocket)?.socket.send(JSON.stringify({ connection: 'lost' }));
			console.log(chalk.red(`Client disconnected with code: ${code}, reason: ${reason.toString()}`));
			allClients = allClients.filter(client => client !== currentClient);
			allClients.forEach(client => {
				client.socket.send(JSON.stringify({ microservice: 'chat', clientDisconnected: true, nickname: currentClient.nickname }));
			}
			);
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