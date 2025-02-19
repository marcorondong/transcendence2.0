import {Player} from "./Player"

export class SessionRoom
{
	readonly id: string; 
	private players: Set<Player>;
	private requiredPlayers: number;
	
	constructor(roomId: string, requiredPlayers:number = 2)
	{
		this.id = roomId;
		this.requiredPlayers = requiredPlayers;
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

	greetPlayer(player: Player): void 
	{
		const greeting: string = `Hello player ${player.id} welcom to room ${this.id}`;
		var update: string; 
		player.connection.send(greeting);
		if(this.getPlayerCount() <= this.requiredPlayers)
		{
			update = `Waiting for ${this.requiredPlayers - this.getPlayerCount()} more player to join`;
			player.connection.send(update);
		}
	}
}