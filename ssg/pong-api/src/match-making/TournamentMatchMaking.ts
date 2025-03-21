import { ETournamentState, Tournament} from "../game/modes/singles/Tournament"
import { PongPlayer } from "../game/PongPlayer";
import { TournamentEvents } from "../customEvents";
import { PongRoomSingle } from "../game/modes/singles/PongRoom";

export class TournamentMatchMaking
{
	private allTournaments: Map<string, Tournament>;

	constructor()
	{
		this.allTournaments = new Map<string, Tournament>();
	}

	putPlayerInTournament(player: PongPlayer, tournamentSizeQuery: number):void
	{
		const tournamentForPlayer:Tournament = this.findTournamentToJoin(tournamentSizeQuery);
		tournamentForPlayer.addPlayer(player);
		const freeSpots = tournamentForPlayer.calculateNumberOfFreeSpots();
		tournamentForPlayer.broadcastTournamentAnnouncement(`We are waiting for ${freeSpots} player to join. Be patient`);
	}

	getMatchesFromAllTournaments():Map<string, PongRoomSingle>
	{
		const allTournamnetsRooms:Map<string, PongRoomSingle> = new Map<string, PongRoomSingle>();
		for(const [key, oneTournament] of this.allTournaments)
		{
			for(const [key, room] of oneTournament.getAllTournamentsRoom())
			{
				allTournamnetsRooms.set(key, room);
			}
		}
		return allTournamnetsRooms;
	}

	private findTournamentToJoin(tournamentSizeQuerry: number): Tournament
	{
		for(const [key, oneTournament] of this.allTournaments)
		{
			if(oneTournament.getState() === ETournamentState.LOBBY && oneTournament.getRequiredPlayers() === tournamentSizeQuerry)
			{
				return oneTournament;
			}
		}
		return this.createTournament(tournamentSizeQuerry);
	}

	private createTournament(tournamentSize:number):Tournament
	{
		const freshTournament:Tournament = new Tournament(tournamentSize);
		this.allTournaments.set(freshTournament.getId(), freshTournament);
		this.tournamentFullListener(freshTournament);
		this.tournamentFinishedListener(freshTournament);
		return freshTournament;
	}

	private tournamentFullListener(freshTournament:Tournament)
	{
		freshTournament.once(TournamentEvents.FULL, ()=>
		{
			console.log(`Tournament ${freshTournament.getId()} is about to start`);
			freshTournament.startTournament();
		})
	}

	private tournamentFinishedListener(freshTournament:Tournament)
	{
		freshTournament.once(TournamentEvents.FINISHED, ()=>
		{
			console.log("Tournamnet is finished. Kicking(closing connection) with everyone");
			freshTournament.kickEveryone();
			this.allTournaments.delete(freshTournament.getId());
		})
	}
}