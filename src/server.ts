import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify'
import fastifyWebsocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

const PORT = 3001;
const HOST = '0.0.0.0';

const fastify: FastifyInstance = Fastify({ logger: false });
let allClients: Client[] = [];
let lookingForGame_nickname: string = '';

class Client 
{
	id: string;
    nickname: string;
    socket: WebSocket;
	friendSocket: WebSocket | null = null;

    constructor(id: string, nickname: string, socket: WebSocket) 
	{
		this.id = id;
        this.nickname = '';
		this.socket = socket;
    }
}

fastify.register(fastifyStatic, {
	root: path.join(__dirname, '../public'),
	prefix: '/', // optional: default '/'
});

fastify.register(fastifyWebsocket);

fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
	return reply.sendFile('tictactoe.html');
});

fastify.register(async function (fastify)
{
	fastify.get('/ws', { websocket: true }, (connection, req) => 
	{
		const socket = connection as unknown as WebSocket;
		const id = uuidv4();
		const currentClient = new Client(id, "", socket);
		console.log(chalk.magentaBright('Client connected'));

		connection.on('message', (message: string) =>
		{
			const data = JSON.parse(message.toString());
			if(data.microservice === 'tictactoe')
			{
				if(data.registration)
				{
					if(allClients.some(client => client.nickname === data.nickname))
					{
						socket.send(JSON.stringify({microservice: 'tictactoe', registration: false}));
						return;
					}
					socket.send(JSON.stringify(data));
					currentClient.nickname = data.nickname;
					allClients.push(currentClient);
					return;
				}
				if(data.lookingForGame)
				{
					if(lookingForGame_nickname !== '')
					{
						const friendClient = allClients.find(client => client.nickname === lookingForGame_nickname);
						if(friendClient)
						{
							currentClient.friendSocket = friendClient.socket;
							friendClient.friendSocket = socket;
							
							const player1Symbol = Math.random() < 0.5 ? 'X' : 'O';
							const player2Symbol = player1Symbol === 'X' ? 'O' : 'X';

							socket.send(JSON.stringify({ microservice: 'tictactoe', startGame: true, friendNickname: friendClient.nickname, yourSymbol: player1Symbol }));
							friendClient.socket.send(JSON.stringify({ microservice: 'tictactoe', startGame: true, friendNickname: currentClient.nickname, yourSymbol: player2Symbol }));

							lookingForGame_nickname = '';
						}
						else
						{
							console.log('Client not found');
						}
					}
					else
					{
						lookingForGame_nickname = currentClient.nickname;
					}
					return;
				}
				if(data.cancelLookingForGame)
				{
					lookingForGame_nickname = '';
					return;
				}
				currentClient.friendSocket?.send(JSON.stringify(data));
			};
		});

		connection.on('close', (code: number, reason: Buffer) => 
		{
			if(currentClient.nickname === lookingForGame_nickname)
			{
				lookingForGame_nickname = '';
			}
			allClients = allClients.filter(client => client !== currentClient);
			console.log(chalk.red(`Client disconnected with code: ${code}, reason: ${reason.toString()}`));
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