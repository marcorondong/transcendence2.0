import type { FastifyInstance } from "fastify";
import {
	postRequestCreateUser,
	getRequestVerifyConnection,
} from "./httpRequests";
import { Client } from "../utils/Client";
import { requests } from "./requests";
import {
	disconnectionHandler,
	errorHandler,
	connectionHandler,
} from "./controllers";
import { checkCookie } from "./service";

export const onlineClients: Map<string, Client> = new Map<string, Client>();

export async function webSocketConnection(server: FastifyInstance) {
	server.get("/chat-api", { websocket: true }, async (socket, request) => {
		try {
			const cookie = checkCookie(request, socket);
			const { id, nickname } = await getRequestVerifyConnection(
				cookie,
				socket,
			);
			let client: Client;
			const isClientOnline = onlineClients.get(id);
			if (!isClientOnline) {
				await postRequestCreateUser(id);
				client = new Client(id, nickname, socket);
				connectionHandler(socket, client, false);
			}
			else {
				client = isClientOnline;
				client.addSocket(socket);
				connectionHandler(socket, client, true);
			}

			const pingInterval = setInterval(() => {
				socket.ping();
			}, 30000);

			socket.on("message", async (message: string) => {
				try {
					await requests(message, client);
				} catch (error) {
					errorHandler(socket, error);
				}
			});

			socket.on("error", (error: any) => {
				errorHandler(socket, error);
			});

			socket.on("pong", () => {
				console.log("Pong received");
			});

			socket.on("close", async () => {
				try {
					clearInterval(pingInterval);
					disconnectionHandler(client, socket);
					console.log(`Client ${client.getNickname()} disconnected`);
				} catch (error) {
					errorHandler(socket, error);
				}
			});
		} catch (error) {
			errorHandler(socket, error);
		}
	});
}
