import { PongPlayer } from "./PongPlayer";
import { EventEmitter } from "node:stream";
import { PongRoom } from "./PongRoom";
import { TournamentEvents, ClientEvents } from "./customEvents";
import { error } from "node:console";

export enum ETournamentState
{
	LOBBY,
	RUNNING,
	FINISHED
}

const validSizeTournament: Set<number> = new Set<number>([4, 8, 16]);

export class Tournament extends EventEmitter
{
	private requiredPlayers:number;
	private playerPool:Set<PongPlayer>;
	private gamesPool:Set<PongRoom>;
	private state: ETournamentState;
	private roundNumber:number;
	private readonly id:string;

	constructor(tournamnetPlayers:number)
	{
		super();
		if(this.isSizeValid(tournamnetPlayers) === false)
			throw error("Tried to create torunament with not valid size");
		this.playerPool = new Set<PongPlayer>();
		this.gamesPool = new Set<PongRoom>();
		this.requiredPlayers = tournamnetPlayers;
		this.state = ETournamentState.LOBBY;
		this.roundNumber = this.requiredPlayers;
		this.id = crypto.randomUUID();
	}

	isSizeValid(requestedSize:number)
	{
		return validSizeTournament.has(requestedSize);
	}

	getAllTournamentsRoom():Map<string, PongRoom>
	{
		const allRooms: Map<string, PongRoom> = new Map<string, PongRoom>(
			[...this.gamesPool].map(room =>[room.getId(), room] as [string, PongRoom])
		);
		return allRooms;
		
	}

	getId()
	{
		return this.id;
	}
	
	getRequiredPlayers():number
	{
		return this.requiredPlayers;
	}

	getState():ETournamentState
	{
		return this.state;
	}
	
	startTournament()
	{
		this.state = ETournamentState.RUNNING;
		this.emit(TournamentEvents.STARTED);
		this.createAndStartRound();
	}

	addPlayer(player:PongPlayer)
	{
		if(this.state==ETournamentState.LOBBY && (this.requiredPlayers > this.playerPool.size))
		{
			this.playerPool.add(player);
			this.connectionMonitor(player);
			if(this.playerPool.size === this.requiredPlayers)
				this.emit(TournamentEvents.FULL);
		}
		else
		{
			const jsonNotification = PongRoom.createMatchStatusUpdate("Tournament is full, you cant join")
			player.sendNotification(JSON.stringify(jsonNotification));
		}
	}
	
	calculateNumberOfFreeSpots():number
	{
		return this.requiredPlayers - this.playerPool.size;
	}

	broadcastTournamentAnnouncement(announcement: string)
	{
		const jsonNotification = PongRoom.createMatchStatusUpdate(announcement);
		for(const player of this.playerPool)
		{
			player.sendNotification(JSON.stringify(jsonNotification));
		}
	}

	kickEveryone()
	{
		for(const player of this.playerPool)
		{
			this.kickPlayer(player);
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
			winner.sendNotification(JSON.stringify(notification));
			console.log("Loser is ", loser.getPlayerSide());
			notification = PongRoom.createMatchStatusUpdate(`MoSt iMpOrTaNt tO pArTiCiPaTe; Kick out in ${room.getRoundName()}`);
			loser.sendNotification(JSON.stringify(notification));
			this.kickPlayer(loser);
			return winner;

		});

		await Promise.all(winnerPromises);
	}

	private finishTournament()
	{
		this.state = ETournamentState.FINISHED;
		this.emit(TournamentEvents.FINISHED);
	}

	private async createAndStartRound()
	{
		if(this.playerPool.size == 1)
		{
			this.finishTournament();
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
		player.on(ClientEvents.GONE_OFFLINE, (unpatient:PongPlayer)=>
		{
			if(this.state === ETournamentState.LOBBY)
			{
				this.playerPool.delete(unpatient)
				this.broadcastTournamentAnnouncement(`Someone left loby, waiting for ${this.calculateNumberOfFreeSpots()} players`)
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
		room.getGame().startGame();
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