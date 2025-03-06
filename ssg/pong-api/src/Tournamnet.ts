import { PongPlayer } from "./PongPlayer";
import { EventEmitter } from "node:stream";
import { PongRoom } from "./PongRoom";

export class Tournament extends EventEmitter
{
	private requiredPlayers:number;
	private playerPool:Set<PongPlayer> = new Set<PongPlayer>();
	private gamesPool:Set<PongRoom> = new Set<PongRoom>();

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

	createAndStartRound()
	{
		let rivals: PongPlayer[] = []
		for(const player of this.playerPool)
		{
			rivals.push(player);
			if(rivals.length === 2)
			{
				const room:PongRoom = PongRoom.createRoomForTwoPlayers(rivals[0], rivals[1]);
				this.gamesPool.add(room);
				room.getGame().start();
				room.getAndSendFramesOnce();
				rivals = [];
			}
		}
	}
}