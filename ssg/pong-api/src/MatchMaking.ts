import { SingleMatchMaking } from "./SingleMatchMaking";
import { TournamentMatchMaking } from "./TournamentMatchMaking";
import { GameRoomQueryI } from ".";
import { WebSocket } from "ws";
import { PongPlayer } from "./PongPlayer";
import { PongRoom } from "./PongRoom";
import { Tournament } from "./Tournamnet";

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
		else if(querry.clientType === "spectator")
			this.spectatorJoiner(connection, querry.roomId);
	}

	private playerJoiner(connection: WebSocket,matchType: "single" | "tournament", tournamentSize:number)
	{
		const player: PongPlayer = new PongPlayer(connection);
		if(matchType == "single")
		{
			this.singlesManger.putPlayerinRandomRoom(player)
		}
		else if(matchType == "tournament")
		{
			if(Tournament.isSizeValid(tournamentSize) === false)
			{
				player.sendNotification(`Size ${tournamentSize} is not valid, Switch to default value ${Tournament.getDefaultTournamnetSize()}`)
				tournamentSize = Tournament.getDefaultTournamnetSize();
			}
			this.tournamentManager.putPlayerInTournament(player, tournamentSize);
		}
	}
	
	private spectatorJoiner(connection: WebSocket, roomId:string | 0)
	{
		if(roomId === 0)
		{
			connection.send("roomId is required querry if you are spectator")
			connection.close();
			return;
		}
		const allRooms: Map<string, PongRoom> = this.getAllActiveRooms();
		const roomToWatch = allRooms.get(roomId);
		if(roomToWatch != undefined)
		{
			roomToWatch.addSpectator(connection);
		}
		else 
		{
			connection.send(`Room with id ${roomId} was not found`);
			return
		}
	}

	private getAllActiveRooms(): Map<string, PongRoom>
	{
		const allRooms: Map<string, PongRoom> = new Map<string, PongRoom>([...this.singlesManger.getAllMatches(),
			...this.tournamentManager.getMatchesFromAllTournaments()]);
		return allRooms;
	}	
}