import Fastify, { FastifyInstance } from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import { Client } from "./Client";
import { onClientMessage, onClientDisconnect } from "./utils";
import { faker } from "@faker-js/faker";
import { postRequestCreateUser, getRequestBlockList } from "./dbUtils";

const PORT = 3002;
const HOST = "0.0.0.0";
export const onlineClients: Map<string, Client> = new Map<string, Client>();

const fastify: FastifyInstance = Fastify({ logger: false });

fastify.register(fastifyWebsocket);

fastify.register(async function (fastify) {
	fastify.get("/ws", { websocket: true }, async (connection, req) => {
			const userId = faker.person.firstName(); // TODO change once I can get the userId from JWT
			const user = await postRequestCreateUser(userId);
			const socket = connection;
			const blockList = new Set<string>(user.blockList);
			const client = new Client(userId, socket, blockList);
			const peopleOnline = Array.from(onlineClients.values()).map((client) =>
				client.getId(),
			);
			socket.send(
				JSON.stringify({
					relatedId: client.getId(), // TODO optional
					welcomeMessage: "Welcome to the chat server!", //TODO optional
					peopleOnline: peopleOnline,
				}),
			);
			onlineClients.forEach((person) => {
				person.getSocket().send(
					JSON.stringify({
						newClient: client.getId(),
					}),
				);
			});
			onlineClients.set(userId, client);
			console.log(`Client ${client.getId()} connected`);

		connection.on("message", async (message: string) => {
			await onClientMessage(message, client);
		});

		connection.on("close", async () => {
			onClientDisconnect(client);
		});
	});
});

const start = async () => {
	try {
		await fastify.listen({ port: PORT, host: HOST });
		console.log(`Server listening at ${PORT}`);
		// fastify.log.info(`Server listening on ${HOST}:${PORT}`);
	} catch (err) {
		console.error(err);
		// fastify.log.error(err);
		process.exit(1);
	}
};
start();
