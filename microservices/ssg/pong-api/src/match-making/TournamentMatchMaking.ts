import { ETournamentState, Tournament } from "../game/modes/singles/Tournament";
import { PongPlayer } from "../game/PongPlayer";
import { TournamentEvents } from "../customEvents";
import { PongRoomSingles } from "../game/modes/singles/PongRoomSingles";

export class TournamentMatchMaking {
	private allTournaments: Map<string, Tournament>;

	constructor() {
		this.allTournaments = new Map<string, Tournament>();
	}

	putPlayerInTournament(
		player: PongPlayer,
		tournamentSizeQuery: number,
	): void {
		const tournamentForPlayer: Tournament =
			this.findTournamentToJoin(tournamentSizeQuery);
		tournamentForPlayer.addPlayer(player);
		const freeSpots = tournamentForPlayer.calculateNumberOfFreeSpots();
		tournamentForPlayer.broadcastTournamentAnnouncement(
			`We are waiting for ${freeSpots} player to join. Be patient`,
		);
	}

	getMatchesFromAllTournaments(): Map<string, PongRoomSingles> {
		const allTournamentsRooms: Map<string, PongRoomSingles> = new Map<
			string,
			PongRoomSingles
		>();
		for (const [key, oneTournament] of this.allTournaments) {
			for (const [key, room] of oneTournament.getAllTournamentsRoom()) {
				allTournamentsRooms.set(key, room);
			}
		}
		return allTournamentsRooms;
	}

	private findTournamentToJoin(tournamentSizeQuery: number): Tournament {
		for (const [key, oneTournament] of this.allTournaments) {
			if (
				oneTournament.getState() === ETournamentState.LOBBY &&
				oneTournament.getRequiredPlayers() === tournamentSizeQuery
			) {
				return oneTournament;
			}
		}
		return this.createTournament(tournamentSizeQuery);
	}

	private createTournament(tournamentSize: number): Tournament {
		const freshTournament: Tournament = new Tournament(tournamentSize);
		this.allTournaments.set(freshTournament.getId(), freshTournament);
		this.tournamentFullListener(freshTournament);
		this.tournamentFinishedListener(freshTournament);
		return freshTournament;
	}

	private tournamentFullListener(freshTournament: Tournament): void {
		freshTournament.once(TournamentEvents.FULL, () => {
			console.log(
				`Tournament ${freshTournament.getId()} is about to start`,
			);
			freshTournament.startTournament();
		});
	}

	private tournamentFinishedListener(freshTournament: Tournament): void {
		freshTournament.once(TournamentEvents.FINISHED, () => {
			console.log(
				"Tournament is finished. Kicking(closing connection) with everyone",
			);
			freshTournament.kickEveryone();
			this.allTournaments.delete(freshTournament.getId());
		});
	}
}
