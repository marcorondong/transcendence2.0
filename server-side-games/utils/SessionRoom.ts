import {Player} from "./Player"

export class SessionRoom
{
	readonly id: string; 
	private players: Set<Player>
	
	constructor(roomId: string)
	{
		this.id = roomId;
		this.players = new Set<Player>();
	}

	addPlayer(player: Player)
	{
		this.players.add(player);
	}

	getPlayerCount(): number 
	{
		return this.players.size;
	}
}