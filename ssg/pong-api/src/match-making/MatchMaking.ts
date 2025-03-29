import { HeadToHeadMatchMaking } from "./SingleMatchMaking";
import { TournamentMatchMaking } from "./TournamentMatchMaking";
import { IGameRoomQuery } from "..";
import { WebSocket } from "ws";
import { PongPlayer } from "../game/PongPlayer";
import { Tournament } from "../game/modes/singles/Tournament";
import { APongRoom } from "../game/APongRoom";
import { APongGame } from "../game/modes/APongGame";

export class MatchMaking 
{
	headToHeadManager: HeadToHeadMatchMaking;
	tournamentManager: TournamentMatchMaking;

	constructor()
	{
		this.headToHeadManager = new HeadToHeadMatchMaking();
		this.tournamentManager = new TournamentMatchMaking();
	}

	matchJoiner(connection: WebSocket, query: IGameRoomQuery)
	{
		if(query.clientType === "player")
			this.playerJoiner(connection, query.matchType,query.tournamentSize, query.roomId);
		else if(query.clientType === "spectator")
			this.spectatorJoiner(connection, query.roomId);
	}

	private playerJoiner(connection: WebSocket, matchType: "singles" | "tournament" | "doubles", tournamentSize: number, roomId: string | 0)
	{
		const player: PongPlayer = new PongPlayer(connection);
		if(matchType === "singles")
			this.singlesRoomJoiner(player, roomId);
		else if(matchType === "doubles")
			this.doublesRoomJoiner(player, roomId);
		else if(matchType === "tournament")
			this.tournamentJoiner(player, tournamentSize);
	}
	
	private singlesRoomJoiner(player: PongPlayer, roomId: string | 0)
	{
		if(roomId === 0)
			this.headToHeadManager.putPlayerinRandomRoom(player)
		else 
			this.headToHeadManager.putPlayerInPrivateRoom(player, roomId, "singles");
	}

	private doublesRoomJoiner(player: PongPlayer, roomId: string | 0)
	{
		if(roomId === 0)
			this.headToHeadManager.putPlayerinRandomRoomDoubles(player)
		else 
			this.headToHeadManager.putPlayerInPrivateRoom(player, roomId, "doubles");
	}

	private tournamentJoiner(player: PongPlayer, tournamentSize: number)
	{
		if(Tournament.isSizeValid(tournamentSize) === false)
		{
			player.sendNotification(`Size ${tournamentSize} is not valid, Switch to default value ${Tournament.getDefaultTournamentSize()}`)
			tournamentSize = Tournament.getDefaultTournamentSize();
		}
		this.tournamentManager.putPlayerInTournament(player, tournamentSize);
	}

	private spectatorJoiner(connection: WebSocket, roomId: string | 0): void
	{
		if(roomId === 0)
		{
			connection.send("roomId is required query if you are spectator")
			connection.close();
			return;
		}
		const allRooms: Map<string, APongRoom<APongGame>> = this.getAllActiveRooms();
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

	private getAllActiveRooms(): Map<string, APongRoom<APongGame>>
	{
		const allRooms: Map<string, APongRoom<APongGame>> = new Map<string, APongRoom<APongGame>>
			([...this.headToHeadManager.getAllMatches(), ...this.tournamentManager.getMatchesFromAllTournaments()]);
		return allRooms;
	}	
}