import { error } from "console";
import { EventEmitter } from "stream";
import { WebSocket, RawData } from "ws";
import { ClientEvents } from "../customEvents";

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

export enum EPlayerRole
{
	LEFT_ONE,
	LEFT_TWO,
	RIGTH_ONE,
	RIGTH_TWO,
	TBD
}

export type ETeamSideFiltered = Exclude<ETeamSide, ETeamSide.TBD>;
export type EPlayerRoleFiltered = Exclude<EPlayerRole, EPlayerRole.TBD>

export class PongPlayer extends EventEmitter
{
	readonly connection: WebSocket;
	private side: ETeamSide; //TBD to be decided
	private status: EPlayerStatus;
	private role: EPlayerRole;

	constructor(socket: WebSocket)
	{
		super();
		this.connection = socket;
		this.role = EPlayerRole.TBD;
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

	setPlayerRole(role: EPlayerRoleFiltered)
	{
		this.role = role;
		if(role === EPlayerRole.LEFT_ONE || role === EPlayerRole.LEFT_TWO)
			this.setTeamSide(ETeamSide.LEFT);
		else if(role === EPlayerRole.RIGTH_ONE || role === EPlayerRole.RIGTH_TWO)
			this.setTeamSide(ETeamSide.RIGTH);
		else 
			throw error("Unexpected player role setted");
	}

	private setTeamSide(side: ETeamSideFiltered)
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