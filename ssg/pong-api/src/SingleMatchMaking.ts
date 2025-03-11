
import { PongRoom } from "./PongRoom"
import { WebSocket, RawData } from "ws";
import { PongPlayer } from "./PongPlayer";
import { RoomEvents } from "./customEvents";


export class SingleMatchMaking
{
	private singleMatches: Map<string, PongRoom> = new Map<string, PongRoom>();

	constructor()
	{

	}

	addRoom(room: PongRoom):void 
	{
		if(this.singleMatches.has(room.getId()))
		{
			console.warn("Tryed to add room with id that already exist in map.");
			return;
		}
		this.singleMatches.set(room.getId(), room);
		this.lobbyMatchMonitor(room);
	}

	removeRoom(room: PongRoom):boolean 
	{
		return this.singleMatches.delete(room.getId());
	}

	getRoom(roomId:string)
	{
		return this.singleMatches.get(roomId);
	}

	isAnyPublicRoomAvailable():false | PongRoom
	{
		let toReturn:PongRoom | false = false;
		for(const [key, oneRoom] of this.singleMatches.entries())
		{
			if(oneRoom.isPrivate() === false && oneRoom.isFull() === false)
			{
				if(toReturn == false)
					toReturn = oneRoom
				else 
				{
					if(oneRoom.getCreationDate() < toReturn.getCreationDate())
						toReturn = oneRoom
				}
			}
		}
		return toReturn
	}

	createRoomAndAddFirstPlayer(connection: WebSocket):PongRoom
	{
		const room:PongRoom = new PongRoom(false);
		this.addRoom(room);
		const leftPlayer: PongPlayer = new PongPlayer(connection, "left");
		room.addLeftPlayer(leftPlayer);
		return room;
	}


	private cleanRoom(roomToClean:PongRoom)
	{
		if(roomToClean.isCleaned)
			return;
		roomToClean.sendCurrentFrame(); //send last frame that notify client of finished game.
		console.log("Clean function");
		roomToClean.isCleaned = true; 
		roomToClean.closeAllConecctionsFromRoom();
		this.removeRoom(roomToClean);
	}


	private async lobbyMatchMonitor(room:PongRoom)
	{
		room.isCleaned = false;
		this.lobbyMonitor(room);
		this.matchMonitor(room);
	}

	private async lobbyMonitor(room:PongRoom)
	{
		room.on(RoomEvents.EMPTY, ()=>
		{
			console.log("Lobby monitor Removing empty room: ");
			this.cleanRoom(room);
		})
	}

	private async matchMonitor(room:PongRoom)
	{
		await room.game.waitForFinalWhistle();
		console.log("match monitor Game finished", room.getId());
		this.cleanRoom(room);
	}
}