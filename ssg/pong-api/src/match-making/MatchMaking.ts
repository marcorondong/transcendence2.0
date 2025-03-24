import { SingleMatchMaking } from "./SingleMatchMaking";
import { TournamentMatchMaking } from "./TournamentMatchMaking";
import { IGameRoomQuery } from "..";
import { WebSocket } from "ws";
import { PongPlayer } from "../game/PongPlayer";
import { PongRoomSingles } from "../game/modes/singles/PongRoomSingles";
import { Tournament } from "../game/modes/singles/Tournament";

export class MatchMaking 
{
	singlesManger: SingleMatchMaking;
	tournamentManager: TournamentMatchMaking;

	constructor()
	{
		this.singlesManger = new SingleMatchMaking();
		this.tournamentManager = new TournamentMatchMaking();
	}

	matchJoiner(connection: WebSocket, query: IGameRoomQuery)
	{
		if(query.clientType === "player")
			this.playerJoiner(connection, query.matchType,query.tournamentSize);
		else if(query.clientType === "spectator")
			this.spectatorJoiner(connection, query.roomId);
	}

	private playerJoiner(connection: WebSocket,matchType: "singles" | "tournament" | "doubles", tournamentSize:number)
	{
		const player: PongPlayer = new PongPlayer(connection);
		if(matchType === "singles")
		{
			this.singlesManger.putPlayerinRandomRoom(player)
		}
		else if(matchType === "tournament")
		{
			if(Tournament.isSizeValid(tournamentSize) === false)
			{
				player.sendNotification(`Size ${tournamentSize} is not valid, Switch to default value ${Tournament.getDefaultTournamnetSize()}`)
				tournamentSize = Tournament.getDefaultTournamnetSize();
			}
			this.tournamentManager.putPlayerInTournament(player, tournamentSize);
		}
		else if(matchType === "doubles")
		{
			this.singlesManger.putPlayerinRandomRoomDoubles(player)
		}
	}
	
	private spectatorJoiner(connection: WebSocket, roomId:string | 0)
	{
		if(roomId === 0)
		{
			connection.send("roomId is required query if you are spectator")
			connection.close();
			return;
		}
		const allRooms: Map<string, PongRoomSingles> = this.getAllActiveRooms();
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

	private getAllActiveRooms(): Map<string, PongRoomSingles>
	{
		const allRooms: Map<string, PongRoomSingles> = new Map<string, PongRoomSingles>([...this.singlesManger.getAllMatches(),
			...this.tournamentManager.getMatchesFromAllTournaments()]);
		return allRooms;
	}	
}