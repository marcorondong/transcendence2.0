import { HeadToHeadMatchMaking } from "./SingleMatchMaking";
import { TournamentMatchMaking } from "./TournamentMatchMaking";
import { WebSocket } from "ws";
import { PongPlayer } from "../game/PongPlayer";
import { Tournament } from "../game/modes/singles/Tournament";
import { APongRoom } from "../game/APongRoom";
import { APongGame } from "../game/modes/APongGame";

export class MatchMaking {
	headToHeadManager: HeadToHeadMatchMaking;
	tournamentManager: TournamentMatchMaking;

	constructor() {
		this.headToHeadManager = new HeadToHeadMatchMaking();
		this.tournamentManager = new TournamentMatchMaking();
	}

	public getPlayerRoomId(playerId: string): string {
		return this.headToHeadManager.getRoomIdOfPlayer(playerId);
	}

	public playerJoinSingles(connectedPlayer: PongPlayer, roomId: string) {
		this.singlesRoomJoiner(connectedPlayer, roomId);
	}

	public playerJoinDoubles(connectedPlayer: PongPlayer, roomId: string) {
		this.doublesRoomJoiner(connectedPlayer, roomId);
	}

	public playerJoinTournament(
		connectedPlayer: PongPlayer,
		tournamentSize: number,
	) {
		this.tournamentJoiner(connectedPlayer, tournamentSize);
	}

	private singlesRoomJoiner(player: PongPlayer, roomId: string) {
		if (roomId === "public")
			this.headToHeadManager.putPlayerInRandomRoom(player);
		else
			this.headToHeadManager.putPlayerInPrivateRoom(
				player,
				roomId,
				"singles",
			);
	}

	private doublesRoomJoiner(player: PongPlayer, roomId: string) {
		if (roomId === "public")
			this.headToHeadManager.putPlayerInRandomRoomDoubles(player);
		else
			this.headToHeadManager.putPlayerInPrivateRoom(
				player,
				roomId,
				"doubles",
			);
	}

	private tournamentJoiner(player: PongPlayer, tournamentSize: number) {
		if (Tournament.isSizeValid(tournamentSize) === false) {
			console.warn(`Tournament size ${tournamentSize} is not valid`);
			player.sendNotification(
				`Size ${tournamentSize} is not valid, Switch to default value ${Tournament.getDefaultTournamentSize()}`,
			);
			tournamentSize = Tournament.getDefaultTournamentSize();
		}
		this.tournamentManager.putPlayerInTournament(player, tournamentSize);
	}

	public spectatorJoiner(connection: WebSocket, roomId: string): void {
		if (roomId === "") {
			connection.send("roomId is required query if you are spectator");
			connection.close();
			return;
		}
		const allRooms: Map<
			string,
			APongRoom<APongGame>
		> = this.getAllActiveRooms();
		const roomToWatch = allRooms.get(roomId);
		if (roomToWatch != undefined) {
			roomToWatch.addSpectator(connection);
		} else {
			connection.send(`Room with id ${roomId} was not found`);
			return;
		}
	}

	private getAllActiveRooms(): Map<string, APongRoom<APongGame>> {
		const allRooms: Map<string, APongRoom<APongGame>> = new Map<
			string,
			APongRoom<APongGame>
		>([
			...this.headToHeadManager.getAllMatches(),
			...this.tournamentManager.getMatchesFromAllTournaments(),
		]);
		return allRooms;
	}
}
