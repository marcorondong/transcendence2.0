import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify'
import fastifyWebsocket, { WebSocket } from '@fastify/websocket';
import { Client } from './Client';
import { onClientMessage, onClientDisconnect } from './utils';
import fs from 'fs';
import { ZodTypeProvider, validatorCompiler, serializerCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';
import { sessionRoutes } from './modules/session/session.routes';
import cors from '@fastify/cors';
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { swaggerOptions, swaggerUiOptions } from './swagger/swagger.options';
// import { ServerError} from './utils/errors';

const PORT = 3002;
const HOST = '0.0.0.0';
let privateKey: string;
let certificate: string;
export let apiKey: string;
export const liveClients: Map<string, Client> = new Map();

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
	const API_KEY_FILE = process.env.API_KEY_FILE;
	if (!API_KEY_FILE)
	{
		throw new Error('API_KEY_FILE environment variable is not set.');
	}
	privateKey = fs.readFileSync(SSL_KEY_FILE, 'utf8');
	certificate = fs.readFileSync(SSL_CERT_FILE, 'utf8');
	apiKey = fs.readFileSync(API_KEY_FILE, 'utf8');
	console.log('SSL certificates loaded successfully.');
} 
catch (error) 
{
	console.error('Error loading SSL certificates:', error);
	process.exit(1); // Exit process if SSL files are missing or unreadable
}

// const fastify: FastifyInstance<Http2SecureServer> = Fastify(
export const server: FastifyInstance = Fastify( 
{
	// http2: true,
	https: {
		key: privateKey,
		cert: certificate
	},
	logger: false 
}).withTypeProvider<ZodTypeProvider>();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

declare module 'fastify' {
	export interface FastifyInstance {
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}
}

server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
	// Extract the Authorization header
	const url = request.raw.url;

	if (url && (url.startsWith('/documentation') || url.startsWith('/ws') || url.startsWith('/session/healthcheck')))
	{
	  return;
	}

	const authHeader = request.headers['authorization'];
  
	// Check if the Authorization header exists and starts with "Bearer "
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
	  reply.status(401).send({ error: 'Unauthorized' });
	  return;
	}
  
	// Extract the API key (the part after "Bearer ")
	const key = authHeader.split(' ')[1];
  
	// Check if the API key matches the expected one
	if (key !== apiKey) {
	  reply.status(401).send({ error: 'Unauthorized' });
	  return;
	}
	console.log('User authenticated:', request.headers['authorization']);
  });

server.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) =>
{
	await server.authenticate(request, reply);
});

server.register(fastifyWebsocket);

server.register(cors, {
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

server.register(fastifySwagger, swaggerOptions);
server.register(fastifySwaggerUi, swaggerUiOptions);

server.register(sessionRoutes, { prefix: '/session' });

server.register(async function (server)
{
	server.get('/ws', { websocket: true }, (socket, request) => 
		{
			const { userName } = request.query as { userName: string };
			const client = liveClients.get(userName);
			if (!userName)
			{
				socket.send('Error: User name is required');
				socket.close();
				return;
			}
			if (!client)
			{
				socket.send('Error: User not initialized');
				socket.close();
				return;
			}
			client.setSocket(socket);
			console.log('Client connected');
			socket.send('Welcome to the chat server!', client.getChatHistory());
			socket.on('message', (message: string) => onClientMessage(message, client));
	
			socket.on('close', (code: number, reason: Buffer) => onClientDisconnect(code, reason, client));
		});
});

const start = async () => 
{
	try 
	{
		await server.listen({ port: PORT, host: HOST })
		console.log(`Server listening at ${PORT}`)

	} 
	catch (err) 
	{
		server.log.error(err)
		process.exit(1)
	}
}

start();