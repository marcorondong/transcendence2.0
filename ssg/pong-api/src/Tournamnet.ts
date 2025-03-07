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

	caluclateNumberOfFreeSpots():number
	{
		return this.requiredPlayers - this.playerPool.size;
	}

	sendAnnouncementToEveryone(announcement: string)
	{
		const update = this.createTournametStatusUpdate(announcement);
		for(const player of this.playerPool)
		{
			player.sendNottification(JSON.stringify(update));
		}
	}

	private createOneRoundMatch(proPlayer1: PongPlayer, proPlayer2: PongPlayer)
	{
		const room:PongRoom = PongRoom.createRoomForTwoPlayers(proPlayer1, proPlayer2);
		this.gamesPool.add(room);
		room.setRoomAsTournament(this.getRoundName(this.playerPool.size));
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
				rivals = [];
			}
		}
		await this.waitForWinners();
		console.log("Now next round can begin");
		this.createAndStartRound();
	}


	private createTournametStatusUpdate(nottification: string)
	{
		return {
			tournamentStatus: nottification
		}
	}

	async waitForWinners()
	{
		const winnerPromises = Array.from(this.gamesPool).map(async(room) => 
		{
			const roundName = this.getRoundName(this.playerPool.size);
			const winner = await room.getRoomWinner();
			const loser = await room.getRoomLoser();
			console.log("Winner is ", winner.getPlayerSide());
			let notification = this.createTournametStatusUpdate("You won, you will progress to next round once all matches of round are done");
			if(this.playerPool.size === 2)
				notification = this.createTournametStatusUpdate("TOUUURNAMENT WINNNER, PRASE and JANJE are yours");
			winner.sendNottification(JSON.stringify(notification));
			console.log("Loser is ", loser.getPlayerSide());
			notification = this.createTournametStatusUpdate(`MoSt iMpOrTaNt tO pArTiCiPaTe; Kick out in ${roundName}`);
			loser.sendNottification(JSON.stringify(notification));
			this.playerPool.delete(loser);
			return winner;

		});

		await Promise.all(winnerPromises);
	}

	private getRoundName(numberOfPlayers: number): string
	{
		if(numberOfPlayers === 2)
			return "finals";
		else if (numberOfPlayers === 4)
			return "semi-finals";
		else if(numberOfPlayers === 8)
			return "quarter finals";
		return `Round of ${numberOfPlayers}`;
	}
}