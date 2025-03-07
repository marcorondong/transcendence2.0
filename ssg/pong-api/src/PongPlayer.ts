import { WebSocket, RawData } from "ws";

export class PongPlayer
{
	readonly connection: WebSocket;
	readonly side: "left" | "right";

	constructor(socket: WebSocket, playerSide: "left" | "right")
	{
		this.connection = socket;
		this.side = playerSide;
	}

	equals(otherPlayer: PongPlayer):boolean
	{
		if(this.connection === otherPlayer.connection)
			return true;
		return false
	}

	getPlayerSide(): "left" | "right"
	{
		return this.side;
	}

}