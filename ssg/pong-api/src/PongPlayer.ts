import { error } from "console";
import { WebSocket, RawData } from "ws";


export type TPlayerSide = "left" | "right" | "TBD"; //TBD means to be decided

export class PongPlayer
{
	readonly connection: WebSocket;
	private side: TPlayerSide; //TBD to be decided

	constructor(socket: WebSocket, playerSide: TPlayerSide)
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

	getPlayerSide(): TPlayerSide
	{
		return this.side;
	}

	getPlayerSideLR(): "left" | "right"
	{
		const LRside = this.side;
		if(LRside === "TBD")
			throw error("Calling function without deciding player side");
		return LRside;
	}

	setPlayerSide(side: "left" | "right")
	{
		this.side = side;
	}

}