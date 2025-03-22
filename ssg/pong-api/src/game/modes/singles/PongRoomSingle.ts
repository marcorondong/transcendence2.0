import { EGameStatus, PongGame } from "./PongGame";
import { IPongFrame } from "./PongGame";
import raf from "raf";
import { ETeamSide, PongPlayer, EPlayerRole, EPlayerRoleFiltered } from "../../PongPlayer";
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

	getMissingPlayerRole():EPlayerRoleFiltered
	{
		if(this.leftPlayer === undefined)
			return EPlayerRole.LEFT_ONE;
		else if(this.rightPlayer === undefined)
			return EPlayerRole.RIGHT_ONE;
		throw Error("Room is full, no player is missing");
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

	async getRoomWinner():Promise<PongPlayer>
	{
		await this.game.waitForFinalWhistle();
		return this.getWinner();
	}
		
	async getRoomLoser():Promise<PongPlayer>
	{
		await this.game.waitForFinalWhistle();
		return this.getLoser();
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

	/**
	 * function that make sure frame are generated only once. This fixed performance bug
	*/
	getAndSendFramesOnce()
	{
		if(this.isFrameGenerating === false)
		{
			this.isFrameGenerating = true;
			this.sendFrames();
		}
	}

	sendCurrentFrame():void
	{
		const frame: IPongFrame = this.getGame().getFrame();
		const frameWithRoomId = {...frame, roomId:this.getId(), knockoutName:this.matchName};
		const frameJson = JSON.stringify(frameWithRoomId);
		this.roomBroadcast(frameJson)
	}

	removePlayer(player:PongPlayer)
	{
		if(player === this.leftPlayer)
			return this.leftPlayer = undefined;
		else if(player === this.rightPlayer)
			return this.rightPlayer = undefined;
		throw error("Player was never added in this room");
	}
			
	private sendFrames()
	{
		const renderFrame = () => {
			this.sendCurrentFrame();
			if(this.getGame().getGameStatus() === EGameStatus.FINISHED)
			{
				return;
			}
			raf(renderFrame);
		};
		raf(renderFrame);
	}

	private getWinner():PongPlayer
	{
		if(this.game.getPongWinnerSide() === "left")
		{
			if (this.leftPlayer === undefined)
				throw Error("Left player dont exist")
			return this.leftPlayer;
		}
		else 
		{
			if(this.rightPlayer === undefined)
				throw Error("Right player dont exist")
			return this.rightPlayer;
		}
	}

	private getLoser():PongPlayer
	{
		if(this.game.getPongWinnerSide() === "left")
		{
			if (this.rightPlayer === undefined)
				throw Error("Right player dont exist")
			return this.rightPlayer;
		}
		else 
		{
			if(this.leftPlayer === undefined)
				throw Error("left player dont exist")
			return this.leftPlayer;
		}
	}
}