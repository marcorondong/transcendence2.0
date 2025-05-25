import { PongPlayer } from "../../PongPlayer";
import { EventEmitter } from "node:stream";
import { PongRoomSingles } from "./PongRoomSingles";
import { TournamentEvents, ClientEvents } from "../../../customEvents";
import { BlockchainQueue } from "../../../blockchain-transaction/BlockchainQueue";
import { BlockchainData } from "../../../blockchain-transaction/BlockchainData";
import { tournamentConfig } from "../../../config";

export enum ETournamentState {
	LOBBY,
	RUNNING,
	FINISHED,
}

const validSizeTournament: Set<number> = new Set<number>(
	tournamentConfig.valid_sizes,
); //new Set<number>([4, 8, 16]);
const defaultSize: number = tournamentConfig.default_size;

export class Tournament extends EventEmitter {
	private requiredPlayers: number;
	private playerPool: Set<PongPlayer>;
	private gamesPool: Set<PongRoomSingles>;
	private state: ETournamentState;
	private roundNumber: number;
	private readonly id: string;

	constructor(tournamentPlayers: number) {
		super();
		if (Tournament.isSizeValid(tournamentPlayers) === false)
			throw new Error("Tried to create tournament with not valid size");
		this.requiredPlayers = tournamentPlayers;
		this.playerPool = new Set<PongPlayer>();
		this.gamesPool = new Set<PongRoomSingles>();
		this.state = ETournamentState.LOBBY;
		this.roundNumber = this.requiredPlayers;
		this.id = crypto.randomUUID();
	}

	static isSizeValid(requestedSize: number): boolean {
		return validSizeTournament.has(requestedSize);
	}

	static getDefaultTournamentSize(): number {
		return defaultSize;
	}

	getAllTournamentsRoom(): Map<string, PongRoomSingles> {
		const allRooms: Map<string, PongRoomSingles> = new Map<
			string,
			PongRoomSingles
		>(
			[...this.gamesPool].map(
				(room) =>
					[room.getGame().getGameId(), room] as [
						string,
						PongRoomSingles,
					],
			),
		);
		return allRooms;
	}

	getId(): string {
		return this.id;
	}

	getRequiredPlayers(): number {
		return this.requiredPlayers;
	}

	getState(): ETournamentState {
		return this.state;
	}

	startTournament(): void {
		this.state = ETournamentState.RUNNING;
		this.emit(TournamentEvents.STARTED);
		this.createAndStartRound();
	}

	addPlayer(player: PongPlayer): void {
		if (
			this.state == ETournamentState.LOBBY &&
			this.requiredPlayers > this.playerPool.size
		) {
			this.playerPool.add(player);
			this.connectionMonitor(player);
			if (this.playerPool.size === this.requiredPlayers)
				this.emit(TournamentEvents.FULL);
		} else {
			const jsonNotification = PongRoomSingles.createMatchStatusUpdate(
				"Tournament is full, you cant join",
			);
			player.sendNotification(JSON.stringify(jsonNotification));
		}
	}

	calculateNumberOfFreeSpots(): number {
		return this.requiredPlayers - this.playerPool.size;
	}

	broadcastTournamentAnnouncement(announcement: string): void {
		const jsonNotification =
			PongRoomSingles.createMatchStatusUpdate(announcement);
		for (const player of this.playerPool) {
			player.sendNotification(JSON.stringify(jsonNotification));
		}
	}

	kickEveryone(): void {
		for (const player of this.playerPool) {
			this.kickPlayer(player);
		}
	}

	private sendMatchToQueue(room: PongRoomSingles) {
		const gameId: string = room.getGame().getGameId();
		const tournamentId: string = this.getId();
		const stageName: string = room.getMatchName();
		const player1: string = room.getWinnerCaptain().getPlayerId();
		const player2: string = room.getLoserCaptain().getPlayerId();
		const score1: number = room.getGame().getScoreBoard().getWinnerGoals();
		const score2: number = room.getGame().getScoreBoard().getLoserGoals();
		BlockchainQueue.putMatchInQue(
			new BlockchainData(
				gameId,
				tournamentId,
				stageName,
				player1,
				player2,
				score1,
				score2,
			),
		);
	}

	async waitForWinners(): Promise<void> {
		const winnerPromises = Array.from(this.gamesPool).map(async (room) => {
			const winner = await room.getRoomWinner();
			const loser = await room.getRoomLoser();
			this.sendMatchToQueue(room);
			//console.log("Winner is ", winner.getTeamSide());
			let notification = PongRoomSingles.createMatchStatusUpdate(
				"You won, you will progress to next round once all matches of round are done",
			);
			if (room.getMatchName() === "finals")
				notification = PongRoomSingles.createMatchStatusUpdate(
					"TOURNAMENT WINNER, GG EASY",
				);
			winner.sendNotification(JSON.stringify(notification));
			//console.log("Loser is ", loser.getTeamSide());
			notification = PongRoomSingles.createMatchStatusUpdate(
				`MoSt iMpOrTaNt tO pArTiCiPaTe; Kick out in ${room.getMatchName()}`,
			);
			loser.sendNotification(JSON.stringify(notification));
			this.kickPlayer(loser);
			return winner;
		});
		await Promise.all(winnerPromises);
	}

	private finishTournament(): void {
		this.state = ETournamentState.FINISHED;
		this.emit(TournamentEvents.FINISHED);
	}

	private async createAndStartRound(): Promise<void> {
		if (this.playerPool.size == 1) {
			this.finishTournament();
			return;
		}
		let rivals: PongPlayer[] = [];
		for (const player of this.playerPool) {
			rivals.push(player);
			if (rivals.length === 2) {
				this.createOneRoundMatch(rivals[0], rivals[1]);
				rivals = [];
			}
		}
		this.roundNumber /= 2;
		await this.waitForWinners();
		this.removeAllGamesFromPool();
		this.createAndStartRound();
	}

	private removeAllGamesFromPool(): void {
		for (const oneGame of this.gamesPool) this.gamesPool.delete(oneGame);
	}

	private connectionMonitor(player: PongPlayer): void {
		player.on(ClientEvents.GONE_OFFLINE, (impatient: PongPlayer) => {
			if (this.state === ETournamentState.LOBBY) {
				this.playerPool.delete(impatient);
				this.broadcastTournamentAnnouncement(
					`Someone left lobby, waiting for ${this.calculateNumberOfFreeSpots()} players`,
				);
			}
		});
	}

	private kickPlayer(proPlayer: PongPlayer): void {
		console.log("Kicking player out of tournament");
		proPlayer.connection.close();
		this.playerPool.delete(proPlayer);
	}

	private createOneRoundMatch(
		proPlayer1: PongPlayer,
		proPlayer2: PongPlayer,
	): void {
		const room: PongRoomSingles = PongRoomSingles.createRoomForTwoPlayers(
			proPlayer1,
			proPlayer2,
		);
		this.gamesPool.add(room);
		room.setRoomAsTournament(this.getRoundName());
		room.getGame().startGame();
		room.checkIfPlayerIsStillOnline(proPlayer1);
		room.checkIfPlayerIsStillOnline(proPlayer2);
		room.getAndSendFramesOnce();
	}

	private getRoundName(): string {
		if (this.roundNumber === 2) return "finals";
		else if (this.roundNumber === 4) return "semi-finals";
		else if (this.roundNumber === 8) return "quarter finals";
		return `Round of ${this.roundNumber}`;
	}
}
