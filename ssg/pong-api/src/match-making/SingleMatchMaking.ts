import { PongRoomSingle } from "../game/modes/singles/PongRoomSingle"
import { WebSocket, RawData } from "ws";
import { EPlayerRole, ETeamSide, PongPlayer } from "../game/PongPlayer";
import { RoomEvents } from "../customEvents";

export class SingleMatchMaking
{
	private singleMatches: Map<string, PongRoomSingle>;

	constructor()
	{
		this.singleMatches = new Map<string,PongRoomSingle>();
	}

	getAllMatches()
	{
		return this.singleMatches;
	}
	
	putPlayerinRandomRoom(player: PongPlayer)
	{
		const roomForPlayer:PongRoomSingle = this.findRoomToJoin();
		const playerRole:EPlayerRole = roomForPlayer.getMissingPlayerRole();
		player.setPlayerRole(playerRole)
		roomForPlayer.addPlayer(player);
	}

	createRoom():PongRoomSingle
	{
		const freshRoom:PongRoomSingle = new PongRoomSingle(false);
		this.singleMatches.set(freshRoom.getId(), freshRoom);
		this.lobbyMatchMonitor(freshRoom);
		return freshRoom;
	}

	removeRoom(room: PongRoomSingle):boolean 
	{
		return this.singleMatches.delete(room.getId());
	}

	getRoom(roomId:string)
	{
		return this.singleMatches.get(roomId);
	}

	findRoomToJoin(): PongRoomSingle
	{
		let toReturn:PongRoomSingle | false = false;
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

	private cleanRoom(roomToClean:PongRoomSingle)
	{
		if(roomToClean.isRoomCleaned() === true)
			return;
		roomToClean.sendCurrentFrame(); //send last frame that notify client of finished game.
		console.log("Clean function");
		roomToClean.setRoomCleanedStatus(true);
		roomToClean.closeAllConecctionsFromRoom();
		this.removeRoom(roomToClean);
	}

	private async lobbyMatchMonitor(room:PongRoomSingle)
	{
		room.setRoomCleanedStatus(false);
		this.lobbyMonitor(room);
		this.matchMonitor(room);
	}

	private async lobbyMonitor(room:PongRoomSingle)
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

	private async matchMonitor(room:PongRoomSingle)
	{
		await room.getGame().waitForFinalWhistle();
		console.log("match monitor Game finished", room.getId());
		this.cleanRoom(room);
	}
}