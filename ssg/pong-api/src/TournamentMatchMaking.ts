import { ETournamentState, Tournament, TValidTournamentSize } from "./Tournamnet"
import { PongPlayer } from "./PongPlayer";
import { TournamentEvents } from "./customEvents";

export class TournamentMatchMaking
{
	private allTournamnets: Map<string, Tournament>;

	constructor()
	{
		this.allTournamnets = new Map<string, Tournament>();
	}

	putPlayerInTournament(player: PongPlayer, tournamentSizeQuerry: TValidTournamentSize):void
	{
		const tournamnetForPlayer:Tournament = this.findTournamentToJoin(tournamentSizeQuerry);
		tournamnetForPlayer.addPlayer(player);
		const freeSpots = tournamnetForPlayer.calculateNumberOfFreeSpots();
		tournamnetForPlayer.broadcastTournamentAnnouncement(`We are waiting for ${freeSpots} player to join. Be patient`);
	}

	private findTournamentToJoin(tournamentSizeQuerry: TValidTournamentSize): Tournament
	{
		for(const [key, oneTournament] of this.allTournamnets)
		{
			if(oneTournament.getState() === ETournamentState.LOBBY && oneTournament.getRequiredPlayers() === tournamentSizeQuerry)
			{
				return oneTournament;
			}
		}
		return this.createTournament(tournamentSizeQuerry);
	}

	private createTournament(tournamentSize:TValidTournamentSize):Tournament
	{
		const freshTournament:Tournament = new Tournament(tournamentSize);
		this.allTournamnets.set(freshTournament.getId(), freshTournament);
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
			this.allTournamnets.delete(freshTournament.getId());
		})
	}
}