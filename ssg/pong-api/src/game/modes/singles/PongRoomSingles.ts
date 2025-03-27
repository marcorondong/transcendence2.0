import { PongGameSingles } from "./PongGameSingles";
import { ETeamSide, PongPlayer, EPlayerRole, EPlayerRoleFiltered, ETeamSideFiltered } from "../../PongPlayer";
import { error } from "console";
import { APongRoom } from "../../APongRoom";

export class PongRoomSingles extends APongRoom<PongGameSingles>
{
	private leftPlayer?:PongPlayer;
	private rightPlayer?:PongPlayer;

	constructor(privateRoom:boolean = false)
	{
		const match = PongGameSingles.createStandardGame();
		super(privateRoom, match);
		this.setMatchName("single match");
	}

	updateOthers(message: string): void {
		return;
	}
	
	sendLobbyUpdateToEveryone(extraInfo:string): void {
		if(this.leftPlayer !== undefined)
			this.sendLobbyUpdate(this.leftPlayer, extraInfo);
		if(this.rightPlayer !== undefined)
			this.sendLobbyUpdate(this.rightPlayer, extraInfo);
	}

	isEmpty(): boolean {
		if(this.leftPlayer === undefined && this.rightPlayer === undefined)
			return true;
		return false;
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
			throw Error("Right player dont exist")
		return this.rightPlayer;
	}

	calculateMissingPlayers(): number {
		let counter = 0;
		if(this.leftPlayer === undefined)
			counter++;
		if(this.rightPlayer === undefined)
			counter++;
		return counter;
	}

	static createRoomForTwoPlayers(playerOne:PongPlayer, playerTwo:PongPlayer):PongRoomSingles
	{
		const room:PongRoomSingles = new PongRoomSingles();
		playerOne.setPlayerRole(EPlayerRole.LEFT_ONE);
		playerTwo.setPlayerRole(EPlayerRole.RIGHT_ONE);
		room.addPlayer(playerOne);
		room.addPlayer(playerTwo);
		return room;
	}

	setRoomAsTournament(roundName:string)
	{
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