import { PongPlayer } from "./PongPlayer";
import { EventEmitter } from "node:stream";
import { PongRoom } from "./PongRoom";

export class Tournament extends EventEmitter
{
	private requiredPlayers:number;
	private playerPool:Set<PongPlayer> = new Set<PongPlayer>();
	private gamesPool:Set<PongRoom> = new Set<PongRoom>();
	private tournamentStatus: "started" | "lobby" | "finished";
	private roundNumber:number;

	constructor(tournamnetPlayers:number)
	{
		super();
		this.requiredPlayers = tournamnetPlayers;
		this.tournamentStatus = "lobby";
		this.roundNumber = this.requiredPlayers;
	}
	
	getRequiredPlayers():number
	{
		return this.requiredPlayers;
	}
	
	startTournament()
	{
		this.tournamentStatus = "started";
		this.createAndStartRound();
	}

	addPlayer(player:PongPlayer)
	{
		if(this.tournamentStatus=="lobby" && (this.requiredPlayers > this.playerPool.size))
		{
			this.playerPool.add(player);
			this.connectionMonitor(player);
			if(this.playerPool.size === this.requiredPlayers)
				this.emit("full tournament")
		}
		else
		{
			const jsonNot = PongRoom.createMatchStatusUpdate("Torunament is full, you cant join")
			player.sendNottification(JSON.stringify(jsonNot));
		}
	}
	
	caluclateNumberOfFreeSpots():number
	{
		return this.requiredPlayers - this.playerPool.size;
	}

	sendAnnouncementToEveryone(announcement: string)
	{
		const update = PongRoom.createMatchStatusUpdate(announcement);
		for(const player of this.playerPool)
		{
			player.sendNottification(JSON.stringify(update));
		}
	}

	async waitForWinners()
	{
		const winnerPromises = Array.from(this.gamesPool).map(async(room) => 
		{
			const winner = await room.getRoomWinner();
			const loser = await room.getRoomLoser();
			console.log("Winner is ", winner.getPlayerSide());
			let notification = PongRoom.createMatchStatusUpdate("You won, you will progress to next round once all matches of round are done");
			if(room.getRoundName() === "finals")
				notification = PongRoom.createMatchStatusUpdate("TOUUURNAMENT WINNNER, PRASE and JANJE are yours");
			winner.sendNottification(JSON.stringify(notification));
			console.log("Loser is ", loser.getPlayerSide());
			notification = PongRoom.createMatchStatusUpdate(`MoSt iMpOrTaNt tO pArTiCiPaTe; Kick out in ${room.getRoundName()}`);
			loser.sendNottification(JSON.stringify(notification));
			this.kickPlayer(loser);
			return winner;

		});

		await Promise.all(winnerPromises);
	}

	private async createAndStartRound()
	{
		if(this.playerPool.size == 1)
		{
			this.emit("done tournament");
			this.tournamentStatus="finished";
			return;
		}
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
		this.roundNumber /= 2;
		await this.waitForWinners();
		console.log("Now next round can begin");
		this.removeAllGamesfromPool();
		this.createAndStartRound();
	}

	private removeAllGamesfromPool()
	{
		for(const oneGame of this.gamesPool)
			this.gamesPool.delete(oneGame);
	}

	private connectionMonitor(player:PongPlayer)
	{
		player.on("connection lost", (unpatient:PongPlayer)=>
		{
			if(this.tournamentStatus === "lobby")
			{
				this.playerPool.delete(unpatient)
				this.sendAnnouncementToEveryone(`Someone left loby, waiting for ${this.caluclateNumberOfFreeSpots()} players`)
			}
		})
	}

	private kickPlayer(proPlayer:PongPlayer)
	{
		console.log("Kicking player out of tournament");
		proPlayer.connection.close();
		this.playerPool.delete(proPlayer);
	}


	private createOneRoundMatch(proPlayer1: PongPlayer, proPlayer2: PongPlayer)
	{
		const room:PongRoom = PongRoom.createRoomForTwoPlayers(proPlayer1, proPlayer2);
		this.gamesPool.add(room);
		room.setRoomAsTournament(this.getRoundName());
		room.getGame().start();
		room.checkIfPlayerIsStillOnline(proPlayer1);
		room.checkIfPlayerIsStillOnline(proPlayer2);
		room.getAndSendFramesOnce();
	}

	private getRoundName(): string
	{
		if(this.roundNumber === 2)
			return "finals";
		else if (this.roundNumber === 4)
			return "semi-finals";
		else if(this.roundNumber === 8)
			return "quarter finals";
		return `Round of ${this.roundNumber}`;
	}
}