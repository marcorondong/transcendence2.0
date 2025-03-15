import { SingleMatchMaking } from "./SingleMatchMaking";
import { TournamentMatchMaking } from "./TournamentMatchMaking";
import { GameRoomQueryI } from ".";
import { WebSocket } from "ws";
import { PongPlayer } from "./PongPlayer";
import { TValidTournamentSize } from "./Tournamnet";


export class MatchMaking 
{
	singlesManger: SingleMatchMaking;
	tournamentManager: TournamentMatchMaking;

	constructor()
	{
		this.singlesManger = new SingleMatchMaking();
		this.tournamentManager = new TournamentMatchMaking();
	}

	matchJoiner(connection: WebSocket, querry: GameRoomQueryI)
	{
		if(querry.clientType === "player")
			this.playerJoiner(connection, querry.matchType,querry.tournamentSize);
		
	}

	private playerJoiner(connection: WebSocket,matchType: "single" | "tournament", tournamentSize:TValidTournamentSize)
	{
		const player: PongPlayer = new PongPlayer(connection);
		if(matchType == "single")
		{
			this.singlesManger.putPlayerinRandomRoom(player)
		}
		else if(matchType == "tournament")
		{
			this.tournamentManager.putPlayerInTournament(player, tournamentSize);
		}
	}
}