import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { Player } from "./Player";
import { onMessage, onClose, onConnection, onError } from "./socketInteractions";
import { zodIdSchema } from "./zodSchema";

export async function webSocketConnection(server: FastifyInstance) {
	server.get("/:id", { websocket: true }, (socket, request) => {
		try {
			const id = zodIdSchema.parse(request.params).id;
			const player = new Player(id, socket);
			console.log("Player connected. playerId:", player.getId()); // TODO remove this in production
			onConnection(socket, player);
			socket.on("message", (message: string) => onMessage(message, player)); 
			socket.on("close", async () => onClose(player));
			socket.on("error", (error: Error) => onError(player, error)); // TODO remove this in production
		} catch (error) {
			console.error("Error handling WebSocket connection:", error); // TODO remove this in production
			socket.close(4000, "Internal server error");
		}
	});
	server.get("/health-check", async (request: FastifyRequest, reply: FastifyReply) => {
		reply.status(200).send({ success: true });});

}
