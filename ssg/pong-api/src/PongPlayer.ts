import { error } from "console";
import { EventEmitter } from "stream";
import { WebSocket, RawData } from "ws";
import { ClientEvents } from "./customEvents";


export enum EPlayerStatus
{
	ONLINE,
	OFFLINE
}

export enum EPlayerSide
{
	LEFT,
	RIGTH,
	TBD
}

export class PongPlayer extends EventEmitter
{
	readonly connection: WebSocket;
	private side: EPlayerSide; //TBD to be decided
	private status: EPlayerStatus;

	constructor(socket: WebSocket, playerSide: EPlayerSide)
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

	getPlayerSide(): EPlayerSide
	{
		return this.side;
	}

	getPlayerSideLR():EPlayerSide.LEFT | EPlayerSide.RIGTH
	{
		const LRside = this.side;
		if(LRside === EPlayerSide.TBD)
			throw error("Calling function without deciding player side");
		return LRside;
	}

	setPlayerSide(side: EPlayerSide)
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