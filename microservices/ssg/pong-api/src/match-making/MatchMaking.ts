import { HeadToHeadMatchMaking } from "./SingleMatchMaking";
import { TournamentMatchMaking } from "./TournamentMatchMaking";
import { WebSocket } from "ws";
import { PongPlayer } from "../game/PongPlayer";
import { Tournament } from "../game/modes/singles/Tournament";
import { APongRoom } from "../game/APongRoom";
import { APongGame } from "../game/modes/APongGame";
import { BOT_NICKNAME } from "../config";
import { ClientEvents } from "../customEvents";

export class MatchMaking {
	headToHeadManager: HeadToHeadMatchMaking;
	tournamentManager: TournamentMatchMaking;
	activePlayers: Map<string, PongPlayer>;

	constructor() {
		this.headToHeadManager = new HeadToHeadMatchMaking();
		this.tournamentManager = new TournamentMatchMaking();
		this.activePlayers = new Map<string, PongPlayer>();
	}

	public addPlayerToActiveList(freshPlayer: PongPlayer): boolean {
		if (freshPlayer.getPlayerNickname() === BOT_NICKNAME) {
			console.log("I am not adding bot to active players");
			return true;
		}
		console.log(
			`Adding player ${freshPlayer.getPlayerNickname()} to active player list`,
		);
		if (this.activePlayers.has(freshPlayer.getPlayerId())) {
			console.warn(
				`Player ${freshPlayer.getPlayerNickname()} already has connection with pong-api`,
			);
			return false;
		}
		this.activePlayers.set(freshPlayer.getPlayerId(), freshPlayer);
		this.goneOfflineMonitor(freshPlayer);
		return true;
	}

	public removePlayerFromActiveList(playerToRemove: PongPlayer): void {
		const key: string = playerToRemove.getPlayerId();
		if (this.activePlayers.delete(key)) {
			console.log(
				`Player ${playerToRemove.getPlayerNickname()} successfully removed from active players list`,
			);
		} else {
			console.warn(
				`Player ${playerToRemove.getPlayerNickname()} IS NOT REMOVED from active list.\n
				It is fine if it is bot since it was never on active list !!!!!!`,
			);
		}
	}

	private goneOfflineMonitor(player: PongPlayer): void {
		player.once(ClientEvents.GONE_OFFLINE, (offline: PongPlayer) => {
			this.removePlayerFromActiveList(offline);
		});
	}

	public getPlayerRoomId(playerId: string): string | false {
		const player = this.activePlayers.get(playerId);
		if (!player) return false;
		if (player.getRoomOfPlayer() === "UNKNOWN") return false;
		return player.getRoomOfPlayer();
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
		if (connectedPlayer.isBot()) {
			connectedPlayer.sendError(
				"Bot cannot join tournament, You can report us to the Office for Robot Rights in Vienna",
			);
			connectedPlayer.connection.close(1008, "Only for humans");
			return;
		}
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
			player.sendError(
				`Size ${tournamentSize} is not valid, Switch to default value ${Tournament.getDefaultTournamentSize()}`,
			);
			tournamentSize = Tournament.getDefaultTournamentSize();
		}
		this.tournamentManager.putPlayerInTournament(player, tournamentSize);
	}

	public spectatorJoiner(connection: WebSocket, roomId: string): void {
		if (roomId === "") {
			PongPlayer.sendErrorMessage(
				"roomId is required if you are spectator",
				connection,
			);
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
			PongPlayer.sendErrorMessage(
				`Room with id ${roomId} was not found`,
				connection,
			);
			connection.close(1008, "Room not found");
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
