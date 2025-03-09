import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify'
import fastifyWebsocket from '@fastify/websocket';
import { Client } from './Client';
import { Message } from './Message';
import { onClientMessage, onClientDisconnect } from './utils';
// import fastifyStatic from '@fastify/static';
// import path from 'path';

const PORT = 3002;
const HOST = '0.0.0.0';

const fastify: FastifyInstance = Fastify({ logger: false });
<<<<<<< HEAD
=======
export let allClients: Client[] = [];
export const chatHistories: Record<string, Record<string, Message[]>> = {};
>>>>>>> origin/main

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
		const id = crypto.randomUUID();
<<<<<<< HEAD
		const currentClient = new Client(id, socket);
=======
		const currentClient = new Client(id, "", socket);
>>>>>>> origin/main
		// allClients.push(currentClient); // This is done after registration is successful
		console.log('Client connected');

		connection.on('message', (message: string) => onClientMessage(message, currentClient));

<<<<<<< HEAD
		connection.on('close', (code: number, reason: Buffer) => onClientDisconnect(code, reason, currentClient));
=======
		connection.on('close', (code: number, reason: Buffer) => onClientDisconnect(currentClient, code, reason));
>>>>>>> origin/main
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