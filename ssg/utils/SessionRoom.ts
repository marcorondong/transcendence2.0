import {Player} from "./Player"
import { WebSocket } from "ws";
export class SessionRoom
{
	protected readonly id: string;
	protected players: Map<string,Player>;
	protected privateRoom: boolean;
	private spectators: Set<WebSocket> = new Set<WebSocket>();
	private requiredPlayers: number;
	protected readonly creationDate:Date; 
	
	constructor(requiredPlayers:number = 2, privateRoom:boolean = false)
	{
		this.id = crypto.randomUUID();
		this.requiredPlayers = requiredPlayers;
		this.players = new Map<string,Player>();
		this.privateRoom = privateRoom;
		this.creationDate = new Date();
	}


	getId():string
	{
		return this.id;
	}

	getCreationDate():Date 
	{
		return this.creationDate;
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

	addSpectator(spectator: WebSocket)
	{
		this.spectators.add(spectator);
	}

	removeSpectator(spectator: WebSocket)
	{
		this.spectators.delete(spectator);
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
		this.spectatorBroadcast(message);
	}

	
	isFull():boolean
	{
		return this.getPlayerCount() === this.requiredPlayers;
	}
	
	isPrivate():boolean
	{
		return this.privateRoom;
	}

	setRoomPrivate():void 
	{
		this.privateRoom = true;
	}

	setRoomPublic(): void 
	{
		this.privateRoom = false;
	}

	private spectatorBroadcast(message: string):void 
	{
		for(const fan of this.spectators)
		{
			fan.send(message);
		}
	}
}