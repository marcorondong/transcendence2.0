import { WebSocket } from "ws";
import { Paddle } from "./Paddle";

export class PongPlayer
{
	readonly connection: WebSocket;
	readonly playerPaddle: Paddle;

	constructor(socket: WebSocket, playerControledPaddle: Paddle)
	{
		this.connection = socket;
		this.playerPaddle = playerControledPaddle;
	}

	equals(otherPlayer: PongPlayer):boolean
	{
		if(this.connection === otherPlayer.connection)
			return true;
		return false
	}

}