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

	equals(otherPlayer: Player):boolean
	{
		if(this.id === otherPlayer.id && this.connection === otherPlayer.connection)
			return true;
		if(this.id === otherPlayer.id)
			console.error("Player comparison is smae on id but not on connection. This means same player on different socket. Should not be possible");
		return this.id === otherPlayer.id;
	}
}