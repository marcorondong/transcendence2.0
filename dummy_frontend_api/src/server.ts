import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify'
// import { Http2SecureServer } from 'http2';
import fastifyWebsocket from '@fastify/websocket';
import { Client } from './Client';
import { onClientMessage, onClientDisconnect } from './utils';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';

const PORT = 3000;
const HOST = '0.0.0.0';
let privateKey: string;
let certificate: string;

try
{
	privateKey = fs.readFileSync(path.join(__dirname, '../ssl/key.pem'), 'utf8');
	certificate = fs.readFileSync(path.join(__dirname, '../ssl/cert.pem'), 'utf8');
}
catch (err)
{
	console.log('Error reading SSL certificates');
	console.log(err);
	process.exit(1);
}

// const fastify: FastifyInstance<Http2SecureServer> = Fastify(
const fastify: FastifyInstance = Fastify( 
{
	// http2: true,
	https: {
		key: privateKey,
		cert: certificate
	},
	logger: false 
});

fastify.register(fastifyStatic, {
	root: path.join(__dirname, '../public'),
	prefix: '/', // optional: default '/'
});

fastify.register(fastifyWebsocket);



fastify.register(async function (fastify)
{
	fastify.get('/ws', { websocket: true }, (connection, req) => 
	{
		const socket = connection as unknown as WebSocket;
		const id = crypto.randomUUID();
		const currentClient = new Client(id, socket);
		// allClients.push(currentClient); // This is done after registration is successful
		// console.log(chalk.magentaBright('Client connected'));
		console.log('Client connected');

		connection.on('message', (message: string) => onClientMessage(message, currentClient));

		connection.on('close', (code: number, reason: Buffer) => onClientDisconnect(code, reason, currentClient));

	});


	fastify.get('/', async (request, reply) => {
		return reply.sendFile('index.html');
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