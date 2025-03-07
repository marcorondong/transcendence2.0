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

	private createOneRoundMatch(proPlayer1: PongPlayer, proPlayer2: PongPlayer)
	{
		const room:PongRoom = PongRoom.createRoomForTwoPlayers(proPlayer1, proPlayer2);
		this.gamesPool.add(room);
		room.getGame().start();
		room.checkIfPlayerIsStillOnline(proPlayer1);
		room.checkIfPlayerIsStillOnline(proPlayer2);
		room.getAndSendFramesOnce();
	}

	async createAndStartRound()
	{
		console.log("Players left in tournamet:", this.playerPool.size)
		if(this.playerPool.size == 1)
			return;
		let rivals: PongPlayer[] = []
		for(const player of this.playerPool)
		{
			rivals.push(player);
			if(rivals.length === 2)
			{
				this.createOneRoundMatch(rivals[0], rivals[1]);
				const room:PongRoom = PongRoom.createRoomForTwoPlayers(rivals[0], rivals[1]);
				rivals = [];
			}
		}
		await this.waitForWinners();
		console.log("Now next round can begin");
		this.createAndStartRound();
	}

	async waitForWinners()
	{
		const winnerPromises = Array.from(this.gamesPool).map(async(room) => 
		{
			const winner = await room.getRoomWinner();
			const loser = await room.getRoomLoser();
			console.log("Winner is ", winner.getPlayerSide());
			console.log("Loser is ", loser.getPlayerSide());
			this.playerPool.delete(loser);
			return winner;

		});

		await Promise.all(winnerPromises);
	}
}