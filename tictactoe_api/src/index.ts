import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify'
import fastifyWebsocket from '@fastify/websocket';
import { Client } from './Client';
import { onClientMessage, onClientDisconnect } from './utils';
import fs from 'fs';

const PORT = 3001;
const HOST = '0.0.0.0';
let privateKey: string;
let certificate: string;

try 
{
	const SSL_KEY_FILE = process.env.SSL_KEY_FILE;
	if (!SSL_KEY_FILE) 
	{
		throw new Error('SSL_KEY_FILE environment variable is not set.');
	}
	const SSL_CERT_FILE = process.env.SSL_CERT_FILE;
	if (!SSL_CERT_FILE) 
	{
		throw new Error('SSL_CERT_FILE environment variable is not set.');
	}
	privateKey = fs.readFileSync(SSL_KEY_FILE, 'utf8');
	certificate = fs.readFileSync(SSL_CERT_FILE, 'utf8');
	console.log('SSL certificates loaded successfully.');
} 
catch (error) 
{
	console.error('Error loading SSL certificates:', error);
	process.exit(1); // Exit process if SSL files are missing or unreadable
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

fastify.register(fastifyWebsocket);

fastify.register(async function (fastify)
{
	fastify.get('/ws', { websocket: true }, (connection, req) => 
	{
		const socket = connection as unknown as WebSocket;
		const id = crypto.randomUUID();
		const currentClient = new Client(id, socket);
		console.log('Client connected');

		connection.on('message', (message: string) => onClientMessage(message, currentClient));

		connection.on('close', (code: number, reason: Buffer) => onClientDisconnect(code, reason, currentClient));
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