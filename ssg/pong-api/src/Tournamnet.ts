import { PongPlayer } from "./PongPlayer";
import { EventEmitter } from "node:stream";

export class Tournament extends EventEmitter
{
	private requiredPlayers:number;
	private playerPool:Set<PongPlayer> = new Set<PongPlayer>();

	constructor(tournamnetPlayers:number)
	{
		super();
		this.requiredPlayers = tournamnetPlayers;
	}

	addPlayer(player:PongPlayer)
	{
		if(this.requiredPlayers > this.playerPool.size)
			this.playerPool.add(player);
		if(this.playerPool.size === this.requiredPlayers)
			this.emit("full tournament")
	}
}