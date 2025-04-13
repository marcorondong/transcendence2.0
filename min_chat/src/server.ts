import Fastify, { FastifyInstance } from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import { Client } from "./Client";
import { onClientMessage, onClientDisconnect } from "./utils";
import { faker } from "@faker-js/faker";

const PORT = 3002;
const HOST = "0.0.0.0";
export const onlineClients: Map<string, Client> = new Map<string, Client>();

const fastify: FastifyInstance = Fastify({ logger: false });

fastify.register(fastifyWebsocket);

fastify.register(async function (fastify) {
	fastify.get("/ws", { websocket: true }, (connection, req) => {
		const id = faker.person.firstName();
		const socket = connection;
		const client = new Client(id, socket);
		const peopleOnline = Array.from(onlineClients.values()).map((client) =>
			client.getId(),
		);
		socket.send(
			JSON.stringify({
				type: "welcome",
				id: client.getId(),
				message: "Welcome to the chat server!",
				peopleOnline: peopleOnline,
			}),
		);
		onlineClients.values().forEach((person) => {
			person.getSocket().send(
				JSON.stringify({
					type: "newClient",
					id: client.getId(),
					message: `${client.getId()} has joined the chat`,
				}),
			);
		});
		onlineClients.set(id, client);
		console.log(`Client ${client.getId()} connected`);

		connection.on("message", async (message: string) => {
			await onClientMessage(message, client);
		});

		connection.on("close", async () => {
			await onClientDisconnect(client);
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
