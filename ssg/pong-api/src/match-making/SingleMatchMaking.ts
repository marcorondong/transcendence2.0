import { PongRoomSingles } from "../game/modes/singles/PongRoomSingles"
import { EPlayerRole, PongPlayer } from "../game/PongPlayer";
import { RoomEvents } from "../customEvents";
import { PongRoomDoubles } from "../game/modes/doubles/PongRoomDoubles";
import { APongRoom } from "../game/APongRoom";
import { PongGameSingles } from "../game/modes/singles/PongGameSingles";
import { APongGame } from "../game/modes/APongGame";

export class SingleMatchMaking
{
	private singleMatches: Map<string, PongRoomSingles>;
	private doubleMatches: Map<string, PongRoomDoubles>

	constructor()
	{
		this.singleMatches = new Map<string, PongRoomSingles>();
		this.doubleMatches = new Map<string, PongRoomDoubles>();
	}

	getAllMatches(): Map<string, APongRoom<APongGame>>
	{
		const joinedMap = new Map<string, APongRoom<APongGame>>([...this.singleMatches, ...this.doubleMatches]);
		return joinedMap;
	}
	
	putPlayerinRandomRoom(player: PongPlayer)
	{
		const roomForPlayer:PongRoomSingles = this.findRoomToJoin(this.singleMatches, "singles");
		this.addPlayerToRoom(player, roomForPlayer);
	}

	putPlayerinRandomRoomDoubles(player: PongPlayer)
	{
		const roomForPlayer:PongRoomDoubles = this.findRoomToJoin(this.doubleMatches, "doubles");
		this.addPlayerToRoom(player, roomForPlayer);
	}

	createRoomSingles():PongRoomSingles
	{
		const freshRoom:PongRoomSingles = new PongRoomSingles(false);
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

	removeRoom(room: APongRoom<APongGame>):boolean 
	{
		if(room instanceof PongGameSingles)
			return this.singleMatches.delete(room.getId());
		else if(room instanceof PongRoomDoubles)
			return this.doubleMatches.delete(room.getId());
		else 
			throw new Error("Unknown instance of room");
	}

	getRoom(roomId:string)
	{
		return this.singleMatches.get(roomId);
	}
	
	findRoomToJoin(mapOfMatches: Map<string, PongRoomSingles>, roomType: "singles"): PongRoomSingles;

	findRoomToJoin(mapOfMathces: Map<string, PongRoomDoubles>, roomType: "doubles"): PongRoomDoubles
	
	findRoomToJoin<T extends APongRoom<PongGameSingles>>(
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

	private addPlayerToRoom(player: PongPlayer, room:APongRoom<APongGame>)
	{
		const playerRole:EPlayerRole = room.getMissingPlayerRole();
		player.setPlayerRole(playerRole)
		room.addPlayer(player);
	}

	private cleanRoom(roomToClean:APongRoom<APongGame>)
	{
		if(roomToClean.isRoomCleaned() === true)
			return;
		roomToClean.sendCurrentFrame(); //send last frame that notify client of finished game.
		console.log("Clean function");
		roomToClean.setRoomCleanedStatus(true);
		roomToClean.closeAllConecctionsFromRoom();
		this.removeRoom(roomToClean);
	}

	private async lobbyMatchMonitor(room:APongRoom<APongGame>)
	{
		room.setRoomCleanedStatus(false);
		this.lobbyMonitor(room);
		this.matchMonitor(room);
	}

	private async lobbyMonitor(room:APongRoom<APongGame>)
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

	private async matchMonitor(room:APongRoom<APongGame>)
	{
		await room.getGame().waitForFinalWhistle();
		console.log("match monitor Game finished", room.getId());
		this.cleanRoom(room);
	}
}