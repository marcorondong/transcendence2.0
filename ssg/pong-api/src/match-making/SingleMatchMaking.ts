import { PongRoom } from "../PongRoom"
import { WebSocket, RawData } from "ws";
import { EPlayerSide, PongPlayer } from "../PongPlayer";
import { RoomEvents } from "../customEvents";

export class SingleMatchMaking
{
	private singleMatches: Map<string, PongRoom>;

	constructor()
	{
		this.singleMatches = new Map<string,PongRoom>();
	}

	getAllMatches()
	{
		return this.singleMatches;
	}
	
	putPlayerinRandomRoom(player: PongPlayer)
	{
		const roomForPlayer:PongRoom = this.findRoomToJoin();
		const playerSide:EPlayerSide = roomForPlayer.getMissingPlayerSide();
		player.setPlayerSide(playerSide);
		roomForPlayer.addPlayer(player);
	}

	createRoom():PongRoom
	{
		const freshRoom:PongRoom = new PongRoom(false);
		this.singleMatches.set(freshRoom.getId(), freshRoom);
		this.lobbyMatchMonitor(freshRoom);
		return freshRoom;
	}

	removeRoom(room: PongRoom):boolean 
	{
		return this.singleMatches.delete(room.getId());
	}

	getRoom(roomId:string)
	{
		return this.singleMatches.get(roomId);
	}

	findRoomToJoin(): PongRoom
	{
		let toReturn:PongRoom | false = false;
		for(const [key, oneRoom] of this.singleMatches.entries())
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
		if(toReturn === false)
			toReturn = this.createRoom();
		return toReturn
	}

	private cleanRoom(roomToClean:PongRoom)
	{
		if(roomToClean.isRoomCleaned() === true)
			return;
		roomToClean.sendCurrentFrame(); //send last frame that notify client of finished game.
		console.log("Clean function");
		roomToClean.setRoomCleanedStatus(true);
		roomToClean.closeAllConecctionsFromRoom();
		this.removeRoom(roomToClean);
	}

	private async lobbyMatchMonitor(room:PongRoom)
	{
		room.setRoomCleanedStatus(false);
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

		room.on(RoomEvents.FULL, ()=>
		{
			console.log("Room is full lets get started");
			room.getAndSendFramesOnce();
			room.getGame().startGame();
		})
	}

	private async matchMonitor(room:PongRoom)
	{
		await room.getGame().waitForFinalWhistle();
		console.log("match monitor Game finished", room.getId());
		this.cleanRoom(room);
	}
}