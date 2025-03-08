import { WebSocket } from "ws";

export class SessionRoom
{
	protected readonly id: string;
	protected connections: Set<WebSocket> = new Set<WebSocket>();
	protected privateRoom: boolean;
	protected readonly creationDate:Date; 
	
	constructor(privateRoom:boolean = false)
	{
		this.id = crypto.randomUUID();
		this.privateRoom = privateRoom;
		this.creationDate = new Date();
	}


	getId():string
	{
		return this.id;
	}

	getCreationDate():Date 
	{
		return this.creationDate;
	}
	
	//TODO: research should this be boolean or Promise async function
	/**
	 * 
	 * @param player player to add
	 * @returns 
	 */
	addConnectionToRoom(connectionToAdd: WebSocket):void
	{
		this.connections.add(connectionToAdd);
	}

	private removeConnectionFromRoom(connectionToRemove: WebSocket):boolean
	{
		return this.connections.delete(connectionToRemove);
	}

	removeAllConnectionsFromRoom():void
	{
		for(const oneConnection of this.connections)
		{
			this.removeConnectionFromRoom(oneConnection);
			console.log("Removing connection from room");
		}
	}

	/**
	 * send same message to all player in room
	 * @param message message to send
	 */
	roomBroadcast(message: string): void 
	{
		for (const oneConnection of this.connections)
		{
			oneConnection.send(message);
		}
	}

	isPrivate():boolean
	{
		return this.privateRoom;
	}
}