import { EventEmitter } from "stream";
import { WebSocket, RawData } from "ws";
import { ClientEvents } from "../customEvents";
import { PongGame } from "./modes/singles/PongGame";
import { Paddle } from "./elements/Paddle";

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
	RIGHT_ONE,
	RIGHT_TWO,
	TBD  //TBD to be decided
}

export type ETeamSideFiltered = Exclude<ETeamSide, ETeamSide.TBD>;
export type EPlayerRoleFiltered = Exclude<EPlayerRole, EPlayerRole.TBD>

export class PongPlayer extends EventEmitter
{
	readonly connection: WebSocket;
	private side: ETeamSide;
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

	getPlayerRole(): EPlayerRoleFiltered
	{
		if(this.role === EPlayerRole.TBD)
			throw Error("Fetching player role but it is not decided yet");
		return this.role;
	}

	getTeamSideLR(): ETeamSideFiltered
	{
		const LRside = this.side;
		if(LRside === ETeamSide.TBD)
			throw Error("Calling function without deciding player side");
		return LRside;
	}

	setPlayerRole(role: EPlayerRoleFiltered)
	{
		this.role = role;
		if(role === EPlayerRole.LEFT_ONE || role === EPlayerRole.LEFT_TWO)
			this.setTeamSide(ETeamSide.LEFT);
		else if(role === EPlayerRole.RIGHT_ONE || role === EPlayerRole.RIGHT_TWO)
			this.setTeamSide(ETeamSide.RIGTH);
		else 
			throw Error("Unexpected player role setted");
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

	getPlayerPaddle<T extends PongGame>(game: T): Paddle
	{
		return game.getPaddle(this.role)
	}
}