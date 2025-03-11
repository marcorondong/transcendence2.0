import { error } from "console";
import { EventEmitter } from "stream";
import { WebSocket, RawData } from "ws";
import { ClientEvents } from "./customEvents";


export enum EPlayerStatus
{
	ONLINE,
	OFFLINE
}

export type TPlayerSide = "left" | "right" | "TBD"; //TBD means to be decided
//type TOnlineStatus = "online" | "offline";

export class PongPlayer extends EventEmitter
{
	readonly connection: WebSocket;
	private side: TPlayerSide; //TBD to be decided
	private status: EPlayerStatus;

	constructor(socket: WebSocket, playerSide: TPlayerSide)
	{
		super();
		this.connection = socket;
		this.side = playerSide;
		this.status = EPlayerStatus.ONLINE;
		this.connectionMonitor();
	}

	private connectionMonitor()
	{
		this.connection.on("close", ()=> 
		{
			this.connection.close();
			console.log("connnection lost");
			this.setPlayerStatus(EPlayerStatus.OFFLINE);
			this.emit(ClientEvents.GONE_OFFLINE, this);
		})
	}

	equals(otherPlayer: PongPlayer):boolean
	{
		if(this.connection === otherPlayer.connection)
			return true;
		return false
	}

	getPlayerSide(): TPlayerSide
	{
		return this.side;
	}

	getPlayerSideLR(): "left" | "right"
	{
		const LRside = this.side;
		if(LRside === "TBD")
			throw error("Calling function without deciding player side");
		return LRside;
	}

	setPlayerSide(side: TPlayerSide)
	{
		this.side = side;
	}

	getPlayerOnlineStatus():EPlayerStatus
	{
		return this.status;
	}
	
	setPlayerStatus(status: EPlayerStatus)
	{
		this.status = status;
	}

	sendNotification(notification: string)
	{
		this.connection.send(notification)
	}

}