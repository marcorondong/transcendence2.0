

import { zodSchema } from "./zodSchema";
import type { Player } from "./Player";
import type { WebSocket } from "@fastify/websocket";
let friendPlayer: Player | null = null;

export function onConnection (socket: WebSocket, player: Player) {
	try {
		if (friendPlayer) {
			if(friendPlayer.getId() === player.getId()) {
				player.sendError("UUID already in use");
				player.setDisconnected(false);
				socket.close(4000, "UUID already in use");
				return;
			}
			const opponent = friendPlayer;
			friendPlayer = null;
			player.finishSetup(opponent);
		} else {
			friendPlayer = player;
		}
	} catch (error) {
		console.error("Error during connection setup:", error); // TODO remove this in production
		player.sendError(`Error during connection setup: ${error}`); // TODO remove this in production
	}
}

export async function onMessage(message: string, player: Player) {
	try {
		const data = JSON.parse(message);
		const { index } = zodSchema.parse(data);
		player.sendIndex(index);
	} catch (error) {
		console.error("Error during onMessage", error); // TODO remove this in production
		player.sendError(`${error}`); // TODO remove this in production
	}
}


export async function onClose(player: Player, pingInterval: any) {
	try {
		clearInterval(pingInterval);
		console.log("player disconnected: playerId:", player.getId()); // TODO remove this in production
		if(player.getDisconnected() === false) return;
		const opponent = player.getOpponentPlayer();
		if (opponent) {
			opponent.opponentDisconnected();
		} else {
			friendPlayer = null;
		}
	} catch (error) {
		console.error("Error handling player disconnect:", error); // TODO remove this in production
		player.sendError(`Error handling player disconnect: ${error}`); // TODO remove this in production
	}
}

export async function onError(player: Player, error: Error) {
	console.error("WebSocket error:", error); // TODO remove this in production
	player.sendError(`WebSocket error: ${error}`); // TODO send standard error message in production
}