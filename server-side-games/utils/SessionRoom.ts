import {Player} from "./Player"

export class SessionRoom
{
	readonly id: string; 
	private players: Set<Player>
	
	constructor(roomId: string)
	{
		this.id = roomId;
	}

	addPlayer(player: Player)
	{
		this.players.add(player);
	}
}