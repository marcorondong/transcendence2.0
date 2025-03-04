
import { PongRoom } from "./PongRoom"
import { Player } from "../../utils/Player";
import { WebSocket, RawData } from "ws";

export class PongRoomManager
{
	private rooms: Map<string, PongRoom> = new Map<string, PongRoom>();

	constructor()
	{

	}

	addRoom(room: PongRoom):void 
	{
		if(this.rooms.has(room.getId()))
		{
			console.warn("Tryed to add room with id that already exist in map.");
			return;
		}
		this.rooms.set(room.getId(), room);
	}

	getRoom(roomId:string)
	{
		return this.rooms.get(roomId);
	}

	isAnyPublicRoomAvailable():false | PongRoom
	{
		let toReturn:PongRoom | false = false;
		for(const [key, oneRoom] of this.rooms.entries())
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
		room.addAndAssingControlsToPlayer(new Player("leftPlayer1", connection), "left");
		return room;
	}
}