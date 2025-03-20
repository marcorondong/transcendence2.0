import { error } from "console";
import { ETeamSide, PongPlayer } from "./PongPlayer";
import { WebSocket, RawData } from "ws";

export enum EPlayerRole
{
	LEFT_ONE,
	LEFT_TWO,
	RIGTH_ONE,
	RIGTH_TWO,
	TBD
}

export type EPlayerRoleFiltered = Exclude<EPlayerRole, EPlayerRole.TBD>

export class PongPlayerDoubles extends PongPlayer
{
	private role: EPlayerRole;

	constructor(socket:WebSocket)
	{
		super(socket);
		this.role = EPlayerRole.TBD;
	}

	setPlayerRole(role: EPlayerRoleFiltered)
	{
		this.role = role;
		if(role === EPlayerRole.LEFT_ONE || role === EPlayerRole.LEFT_TWO)
			super.setTeamSide(ETeamSide.LEFT);
		else if(role === EPlayerRole.RIGTH_ONE || role === EPlayerRole.RIGTH_TWO)
			super.setTeamSide(ETeamSide.RIGTH);
		else 
			throw error("Unexpected player role setted");
	}
}