import type { FastifyInstance } from "fastify";
import { faker } from "@faker-js/faker"; // TODO remove once I can get the userId from JWT
import { Player } from "../utils/Player";
import { postResult } from "../utils/dbUtils";
import { zodSchema } from "./zodSchema";

let friendPlayer: Player | null = null;

export async function webSocketConnection(server: FastifyInstance) {
	server.get("", { websocket: true }, (socket, request) => {
		const id = faker.person.firstName(); // TODO extract id from JWT token
		const player = new Player(id, socket);
		console.log("Player connected. playerId:", player.getId()); // TODO remove this in production
		if (friendPlayer) {
			const opponent = friendPlayer;
			friendPlayer = null;
			player.finishSetup(opponent);
		} else {
			friendPlayer = player;
		}

		socket.on("message", (message: string) => {
			try {
				const data = JSON.parse(message);
				const { index } = zodSchema.parse(data);
				player.sendIndex(index);
			} catch (error) {
				console.error(error); // TODO remove this in production
				socket.send(JSON.stringify(error)); // TODO send standard error message in production
			}
		});

		socket.on("close", async (code: number, reason: Buffer) => {
			try {
				console.log("player disconnected: playerId:", player.getId()); // TODO remove this in production
				const opponent = player.getOpponentPlayer();
				if (opponent && player.getDisconnected() === true) {
					const opponentSign = opponent.getSign();
					if (opponentSign === "X") {
						const response = await postResult(
							opponent.getId(),
							player.getId(),
							opponentSign,
						);
						if (!response) {
							console.error("Failed to save game result");
							opponent.getSocket().send(
								JSON.stringify({
									error: "Failed to save game result",
								}),
							);
						}
					} else {
						const response = await postResult(
							player.getId(),
							opponent.getId(),
							opponentSign,
						);
						if (!response) {
							console.error("Failed to save game result");
							opponent.getSocket().send(
								JSON.stringify({
									error: "Failed to save game result",
								}),
							);
						}
					}
					opponent.getSocket().send(
						JSON.stringify({
							gameOver: "Your friend has left the game",
						}),
					);
					opponent.setDisconnected(false);
					opponent.getSocket().close();
				} else {
					friendPlayer = null;
				}
			} catch (error) {
				console.error("Error handling player disconnect:", error); // TODO remove this in production
			}
		});
		// connection.on('message', (message: string) => onPlayerMessage(message, player));

		// connection.on('close', (code: number, reason: Buffer) => onPlayerDisconnect(code, reason, player));
	});
}
