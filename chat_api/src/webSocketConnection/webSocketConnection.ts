import type { FastifyInstance } from "fastify";
import { faker } from "@faker-js/faker"; // TODO remove once I can get the userId from JWT
import { postRequestCreateUser } from "./service";
import { Client } from "../utils/Client";
import type { WebSocket } from "@fastify/websocket";
import type { FastifyRequest } from "fastify";
import { webSocketRequests } from "./requests";
import {
	blockListSchema,
	peopleOnlineResponseSchema,
	newClientResponseSchema,
} from "./zodSchemas";
export const onlineClients: Map<string, Client> = new Map<string, Client>();

function handleConnection(
	socket: WebSocket,
	request: FastifyRequest,
	client: Client,
) {
	const peopleOnline = Array.from(onlineClients.values()).map((client) =>
		client.getId(),
	);
	const peopleOnlineResponse = peopleOnlineResponseSchema.parse({
		type: "peopleOnline",
		peopleOnline: peopleOnline,
		notification: `Welcome to the chat server!`,
	});
	const newClientResponse = newClientResponseSchema.parse({
		type: "newClient",
		relatedId: client.getId(),
		notification: `${client.getId()} joined server!`,
	});
	socket.send(JSON.stringify(peopleOnlineResponse));
	onlineClients.forEach((person) => {
		person.getSocket().send(JSON.stringify(newClientResponse));
	});
	onlineClients.set(client.getId(), client);
	console.log(`Client ${client.getId()} connected`);
}

export async function webSocketConnection(server: FastifyInstance) {
	server.get("", { websocket: true }, async (socket, request) => {
		const userId = faker.person.firstName(); // TODO change once I can get the userId from JWT
		const user = await postRequestCreateUser(userId);
		const blockList = new Set<string>(
			blockListSchema.parse(user).blockList,
		);
		const client = new Client(userId, socket, blockList);

		handleConnection(socket, request, client);

		socket.on("message", async (message: string) => {
			try {
				await webSocketRequests(message, client);
			} catch (error) {
				server.log.error(error);
				socket.send(
					JSON.stringify({
						type: "error",
						error: `${error}`,
					}),
				);
			}
		});

		socket.on("close", async () => {
			console.log(`Client ${client.getId()} disconnected`); // TODO for debugging purposes
			onlineClients.delete(client.getId());
			onlineClients.forEach((person) => {
				person.getSocket().send(
					JSON.stringify({
						clientDisconnected: true,
						relatedId: client.getId(),
					}),
				);
			});
		});
	});
}
