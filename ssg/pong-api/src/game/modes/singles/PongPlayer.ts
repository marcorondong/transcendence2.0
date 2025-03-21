import { error } from "console";
import { EventEmitter } from "stream";
import { WebSocket, RawData } from "ws";
import { ClientEvents } from "../../../customEvents";

export enum EPlayerStatus
{
	ONLINE,
	OFFLINE
}

export enum ETeamSide
{
	LEFT,
	RIGTH,
	TBD
}

export type ETeamSideFiltered = Exclude<ETeamSide, ETeamSide.TBD>;

export class PongPlayer extends EventEmitter
{
	readonly connection: WebSocket;
	private side: ETeamSide; //TBD to be decided
	private status: EPlayerStatus;

	constructor(socket: WebSocket)
	{
		super();
		this.connection = socket;
		this.side = ETeamSide.TBD;
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

	equals(otherPlayer: PongPlayer): boolean
	{
		if(this.connection === otherPlayer.connection)
			return true;
		return false
	}

	getTeamSide(): ETeamSide
	{
		return this.side;
	}

	getTeamSideLR(): ETeamSideFiltered
	{
		const LRside = this.side;
		if(LRside === ETeamSide.TBD)
			throw error("Calling function without deciding player side");
		return LRside;
	}

	setTeamSide(side: ETeamSideFiltered)
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