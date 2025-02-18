import { WebSocket } from "ws";

export class Player
{
	readonly id: string; 
	readonly connection: WebSocket
	
	constructor(playerId: string, socket:WebSocket)
	{
		this.id = playerId;
		this.connection = socket
	}
}