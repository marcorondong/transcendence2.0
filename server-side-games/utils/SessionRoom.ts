import {Player} from "./Player"

export class SessionRoom
{
	readonly id: string; 
	protected players: Map<string,Player>;
	private requiredPlayers: number;
	
	constructor(roomId: string, requiredPlayers:number = 2)
	{
		this.id = roomId;
		this.requiredPlayers = requiredPlayers;
		this.players = new Map<string,Player>();
	}

	//TODO: research should this be boolean or Promise async function
	/**
	 * 
	 * @param player player to add
	 * @returns 
	 */
	addPlayer(player: Player):boolean
	{
		if(this.getPlayerCount() < this.requiredPlayers)
		{
			this.players.set(player.id, player);
			return true;
		}
		console.warn(`Player ${player.id} cannot join full room ${this.id}`);
		return false;
	}

	removePlayer(player: Player)
	{
		this.players.delete(player.id)
	}

	getPlayerCount(): number 
	{
		return this.players.size;
	}

	greetPlayer(player: Player): void 
	{
		const greeting: string = `Hello player ${player.id} welcome to room ${this.id}`;
		var update: string; 
		player.connection.send(greeting);
		if(this.getPlayerCount() <= this.requiredPlayers)
		{
			update = `Waiting for ${this.requiredPlayers - this.getPlayerCount()} more player to join`;
			player.connection.send(update);
		}
	}

	/**
	 * send same message to all player in room
	 * @param message message to send
	 */
	roomBroadcast(message: string): void 
	{
		for (const player of this.players.values())
		{
			player.connection.send(message);
		}
	}
	
	isFull():boolean
	{
		return this.getPlayerCount() === this.requiredPlayers;
	}
}