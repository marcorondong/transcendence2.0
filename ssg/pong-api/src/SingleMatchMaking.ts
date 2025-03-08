
import { PongRoom } from "./PongRoom"
import { WebSocket, RawData } from "ws";
import { PongPlayer } from "./PongPlayer";


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
		this.monitorRoom(room);
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

	private async monitorRoom(room:PongRoom)
	{
		await room.game.waitForFinalWhistle();
		console.log("Game finished");
		room.closeAllConecctionsFromRoom();
		this.removeRoom(room);
	}
}