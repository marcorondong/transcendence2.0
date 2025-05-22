import type { FastifyInstance } from "fastify";
import { Player } from "./Player";
import {
	onMessage,
	onClose,
	onConnection,
	onError,
} from "./socketInteractions";
import { checkCookie } from "./service";
import { env } from "../utils/env";
import { getRequestVerifyConnection } from "./httpRequests";

export async function webSocketConnection(server: FastifyInstance) {
	server.get(
		env.TICTACTOE_API_CONNECTION_STATIC,
		{ websocket: true },
		async (socket, request) => {
			try {
				const cookie = checkCookie(request, socket);
				const { id, nickname } = await getRequestVerifyConnection(
					cookie,
					socket,
				);
				const pingInterval = setInterval(() => {
					socket.ping();
				}, 30000);
				const player = new Player(id, nickname, socket);
				console.log("Player connected. playerId:", player.getId()); // TODO remove this in production
				onConnection(socket, player);
				socket.on("message", (message: string) =>
					onMessage(message, player),
				);
				socket.on("pong", () => {
					console.log("Pong received");
				});
				socket.on("close", async () => onClose(player, pingInterval));
				socket.on("error", (error: Error) => onError(player, error)); // TODO remove this in production
			} catch (error) {
				console.error("Error handling WebSocket connection:", error); // TODO remove this in production
				socket.close(4000, "Internal server error");
			}
		},
	);
	server.get(
		env.TICTACTOE_API_HEALTH_CHECK_STATIC,
		async (request, reply) => {
			reply.status(200).send({ success: true });
		},
	);
}
