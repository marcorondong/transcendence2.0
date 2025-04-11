import { RouteShorthandOptions } from "fastify";
import { FastifyRequest } from "fastify";
import {
	wsZodParamSchema,
	wsZodMessageSchema,
	wsMessageInput,
} from "./ws.schemas";
import { liveClients } from "../../index";
import { onClientMessage, onClientDisconnect } from "./ws.controllers";
import { WebSocket } from "@fastify/websocket";

export async function wsOptions(socket: WebSocket, request: FastifyRequest) {
	try {
		const { userName } = wsZodParamSchema.parse(request.params);
		const client = liveClients.get(userName);
		if (!client) {
			console.error("User not initialized");
			socket.send("Error: User not initialized");
			socket.close();
			return;
		}
		client.setSocket(socket);

		socket.on("message", (message: string) =>
			onClientMessage(message, client),
		);

		socket.on("close", (code: number, reason: Buffer) =>
			onClientDisconnect(code, reason, client),
		);
	} catch (error) {
		console.error("Error in WebSocket controller:");
		socket.send("Error: " + error);
		// socket.close();
	}
}
