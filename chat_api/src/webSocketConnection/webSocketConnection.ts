import type { FastifyInstance } from "fastify";
import { faker } from "@faker-js/faker"; // TODO remove once I can get the userId from JWT
import { postRequestCreateUser } from "./service";
import { Client } from "../utils/Client";
import type { WebSocket } from "@fastify/websocket";
import type { FastifyRequest } from "fastify";
import { requests } from "./requests";
import {
	onlineUsersResponseSchema,
	newUserResponseSchema,
	errorResponseSchema,
	disconnectedResponseSchema,
} from "./zodSchemas";

export const onlineClients: Map<string, Client> = new Map<string, Client>();

function errorHandler(socket: WebSocket, error: any) {
	const errorResponse = errorResponseSchema.parse({
		type: "error",
		errorMessage: `${error}`,
	});
	socket.send(JSON.stringify(errorResponse));
	console.error(error);
}

function connectionHandler(
	socket: WebSocket,
	request: FastifyRequest,
	client: Client,
) {
	const currentId = client.getId();
	const currentNickname = client.getNickname();
	const onlineUsers = Array.from(onlineClients.values()).map((client) => ({
		id: client.getId(),
		nickname: client.getNickname(),
	}));
	const onlineUsersResponse = onlineUsersResponseSchema.parse({
		type: "onlineUsers",
		users: onlineUsers,
		me: {
			id: currentId,
			nickname: currentNickname,
		},
	});
	const newUserResponse = newUserResponseSchema.parse({
		type: "newUser",
		user: {
			id: currentId,
			nickname: currentNickname,
		},
	});
	console.log(onlineUsersResponse);
	console.log(newUserResponse);
	socket.send(JSON.stringify(onlineUsersResponse));
	onlineClients.forEach((person) => {
		person.getSocket().send(JSON.stringify(newUserResponse));
	});
	onlineClients.set(currentId, client);
	console.log(`Client ${currentNickname} connected`);
}

export async function webSocketConnection(server: FastifyInstance) {
	server.get("", { websocket: true }, async (socket, request) => {
		try {
			const cookie = request.headers.cookie;
			const token = request.cookies.access_token;
			if(!cookie) {
				errorHandler(socket, "Missing cookie");
				socket.close();
				return;
			}
			if(!token) {
				errorHandler(socket, "Missing access token");
				socket.close();
				return;
			}
			const response = await fetch("http://auth_api_container:2999/auth-api/verify-connection", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Cookie": cookie,
				},
			});
			if (!response.ok) {
				errorHandler(socket, "Invalid access token");
				socket.close();
				return;
			}
			const data = await response.json();
			await postRequestCreateUser(data.id);
			const client = new Client(data.id, data.nickname, socket);
			const pingInterval = setInterval(() => {
				socket.ping();
			}, 30000);

			connectionHandler(socket, request, client);

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

			socket.on("ping", () => {
				socket.pong();
			});

			socket.on("pong", () => {
				console.log("Pong received");
			});

			socket.on("close", async () => {
				try {
					clearInterval(pingInterval);
					console.log(`Client ${client.getId()} disconnected`); // TODO for debugging purposes
					onlineClients.delete(client.getId());
					const disconnectedResponse =
						disconnectedResponseSchema.parse({
							type: "disconnected",
							user: {
								id: client.getId(),
								nickname: client.getNickname(),
							},
						});
					onlineClients.forEach((person) => {
						person
							.getSocket()
							.send(JSON.stringify(disconnectedResponse));
					});
				} catch (error) {
					errorHandler(socket, error);
				}
			});
		} catch (error) {
			errorHandler(socket, error);
		}
	});
}
