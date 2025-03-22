import { EGameStatus, PongGame } from "./PongGame";
import { IPongFrame } from "./PongGame";
import raf from "raf";
import { ETeamSide, PongPlayer, EPlayerRole, EPlayerRoleFiltered, ETeamSideFiltered } from "../../PongPlayer";
import { error } from "console";
import { APongRoom } from "../../APongRoom";

export class PongRoomSingle extends APongRoom<PongGame>
{
	private leftPlayer?:PongPlayer;
	private rightPlayer?:PongPlayer;
	private tournamentRoom:boolean;

	constructor(privateRoom:boolean = false)
	{
		const match = PongGame.createStandardGame();
		super(privateRoom, match);
		this.setMatchName("single Match")
		this.tournamentRoom = false;
	}

	getGameFrame() {
		return this.getGame().getFrame();
	}

	getMissingPlayerRole():EPlayerRoleFiltered
	{
		if(this.leftPlayer === undefined)
			return EPlayerRole.LEFT_ONE;
		else if(this.rightPlayer === undefined)
			return EPlayerRole.RIGHT_ONE;
		throw Error("Room is full, no player is missing");
	}

	getLeftCaptain(): PongPlayer
	{
		if (this.leftPlayer === undefined)
			throw Error("Left player dont exist")
		return this.leftPlayer;
	}

	getRightCaptain(): PongPlayer
	{
		if (this.rightPlayer === undefined)
			throw Error("Left player dont exist")
		return this.rightPlayer;
	}

	static createRoomForTwoPlayers(playerOne:PongPlayer, playerTwo:PongPlayer):PongRoomSingle
	{
		const room:PongRoomSingle = new PongRoomSingle();
		playerOne.setPlayerRole(EPlayerRole.LEFT_ONE);
		playerTwo.setPlayerRole(EPlayerRole.RIGHT_ONE);
		room.addPlayer(playerOne);
		room.addPlayer(playerTwo);
		return room;
	}

	setRoomAsTournament(roundName:string)
	{
		this.tournamentRoom = true;
		this.setMatchName(roundName);
	}

	setMissingPlayer(player: PongPlayer): void
	{
		if(player.getTeamSideLR() === ETeamSide.LEFT)
		{
			if(this.leftPlayer !== undefined)
				throw new Error(`${player.getTeamSide()} player already exist. Cannot overwrite it`);
			this.leftPlayer = player
		}
		else if(player.getTeamSideLR() === ETeamSide.RIGTH)
		{
			if(this.rightPlayer !== undefined)
				throw new Error(`${player.getTeamSide()} player already exist. Cannot overwrite it`);
			this.rightPlayer = player;
		}
	}

	isFull():boolean
	{
		if (this.leftPlayer !== undefined  && this.rightPlayer !== undefined)
			return true
		return false;
	}

	removePlayer(player:PongPlayer)
	{
		if(player === this.leftPlayer)
			return this.leftPlayer = undefined;
		else if(player === this.rightPlayer)
			return this.rightPlayer = undefined;
		throw error("Player was never added in this room");
	}

}