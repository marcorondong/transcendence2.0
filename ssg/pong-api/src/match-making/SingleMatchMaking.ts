import { PongRoomSingle } from "../game/modes/singles/PongRoomSingle"
import { WebSocket, RawData } from "ws";
import { EPlayerRole, ETeamSide, PongPlayer } from "../game/PongPlayer";
import { RoomEvents } from "../customEvents";
import { PongRoomDoubles } from "../game/modes/doubles/PongRoomDoubles";
import { APongRoom } from "../game/APongRoom";
import { PongGame } from "../game/modes/singles/PongGame";

export class SingleMatchMaking
{
	private singleMatches: Map<string, PongRoomSingle>;
	private doubleMatches: Map<string, PongRoomDoubles>

	constructor()
	{
		this.singleMatches = new Map<string,PongRoomSingle>();
		this.doubleMatches = new Map<string, PongRoomDoubles>();
	}

	getAllMatches()
	{
		return this.singleMatches;
	}
	
	putPlayerinRandomRoom(player: PongPlayer)
	{
		const roomForPlayer:PongRoomSingle = this.findRoomToJoin(this.singleMatches, "singles");
		const playerRole:EPlayerRole = roomForPlayer.getMissingPlayerRole();
		player.setPlayerRole(playerRole)
		roomForPlayer.addPlayer(player);
	}

	putPlayerinRandomRoomDoubles(player: PongPlayer)
	{
		const roomForPlayer:PongRoomDoubles = this.findRoomToJoin(this.doubleMatches, "doubles");
		const playerRole:EPlayerRole = roomForPlayer.getMissingPlayerRole();
		player.setPlayerRole(playerRole)
		roomForPlayer.addPlayer(player);
	}

	createRoomSingles():PongRoomSingle
	{
		const freshRoom:PongRoomSingle = new PongRoomSingle(false);
		this.singleMatches.set(freshRoom.getId(), freshRoom);
		this.lobbyMatchMonitor(freshRoom);
		return freshRoom;
	}

	createRoomDoubles(): PongRoomDoubles
	{
		const freshRoom: PongRoomDoubles = new PongRoomDoubles(false);
		this.doubleMatches.set(freshRoom.getId(), freshRoom);
		this.lobbyMatchMonitor(freshRoom);
		return freshRoom;
	}

	removeRoom(room: APongRoom<PongGame>):boolean 
	{
		return this.singleMatches.delete(room.getId());
	}

	getRoom(roomId:string)
	{
		return this.singleMatches.get(roomId);
	}
	
	findRoomToJoin(mapOfMatches: Map<string, PongRoomSingle>, roomType: "singles"): PongRoomSingle;

	findRoomToJoin(mapOfMathces: Map<string, PongRoomDoubles>, roomType: "doubles"): PongRoomDoubles
	
	findRoomToJoin<T extends APongRoom<PongGame>>(
		mapOfMathces: Map<string, T>, 
		roomType: "singles" | "doubles"): T
	{
		let toReturn:T | false = false;
		for(const [key, oneRoom] of mapOfMathces.entries())
		{
			if(oneRoom.isPrivate() === false && oneRoom.isFull() === false)
			{
				if(toReturn === false)
					toReturn = oneRoom
				else
				{
					if(oneRoom.getCreationDate() < toReturn.getCreationDate())
						toReturn = oneRoom
				}
			}
		}
		if (toReturn === false) {
			return (roomType === "singles" 
				? (this.createRoomSingles() as unknown as T)
				: (this.createRoomDoubles() as unknown as T));
		}
		return toReturn
	}

	private cleanRoom(roomToClean:APongRoom<PongGame>)
	{
		if(roomToClean.isRoomCleaned() === true)
			return;
		roomToClean.sendCurrentFrame(); //send last frame that notify client of finished game.
		console.log("Clean function");
		roomToClean.setRoomCleanedStatus(true);
		roomToClean.closeAllConecctionsFromRoom();
		this.removeRoom(roomToClean);
	}

	private async lobbyMatchMonitor(room:APongRoom<PongGame>)
	{
		room.setRoomCleanedStatus(false);
		this.lobbyMonitor(room);
		this.matchMonitor(room);
	}

	private async lobbyMonitor(room:APongRoom<PongGame>)
	{
		room.on(RoomEvents.EMPTY, ()=>
		{
			console.log("Lobby monitor Removing empty room: ");
			this.cleanRoom(room);
		})

		room.on(RoomEvents.FULL, ()=>
		{
			console.log("Room is full lets get started");
			room.getAndSendFramesOnce();
			room.getGame().startGame();
		})
	}

	private async matchMonitor(room:APongRoom<PongGame>)
	{
		await room.getGame().waitForFinalWhistle();
		console.log("match monitor Game finished", room.getId());
		this.cleanRoom(room);
	}
}