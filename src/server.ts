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

    constructor(id: string, nickname: string, socket: WebSocket) 
	{
        this.id = id;
		this.socket = socket;
        this.nickname = '';
    }
}

interface Message 
{
	text: string;
	isOwnMessage: boolean;
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
		const client = new Client(id, "", socket);
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
					client.nickname = data.nickname;
					allClients.push(client);
					socket.send(JSON.stringify({ microservice: 'chat', registration: true, nickname: client.nickname }));
					sendAllClients();
					return;
				}
				if(data.chatHistoryRequest)
				{
					if(!chatHistories[data.nickname] || !chatHistories[data.nickname][data.chatingWith])
					{
						socket.send(JSON.stringify({ ...data, chatHistory: [] }));
						return;
					}
					const chatHistory = chatHistories[data.nickname][data.chatingWith];
					socket.send(JSON.stringify({ ...data, chatHistory: chatHistory }));
					return;
				}
			};
		});

		connection.on('close', (code: number, reason: Buffer) => 
		{
			// client.friendSocket && allClients.get(client.friendSocket)?.socket.send(JSON.stringify({ connection: 'lost' }));
			sendToAllClients({ peopleOnline: false, nickname: client.nickname }, socket);
			console.log(chalk.red(`Client disconnected with code: ${code}, reason: ${reason.toString()}`));
			allClients = allClients.filter(c => c !== client);
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