import { APongRoom } from "../../APongRoom";
import { PongPlayer } from "../../PongPlayer";
import { PongGameDoubles } from "./PongGameDoubles";
import { EPlayerRoleFiltered, EPlayerRole } from "../../PongPlayer";

export class PongRoomDoubles extends APongRoom<PongGameDoubles>
{
	private leftPlayerOne?:PongPlayer;
	private leftPlayerTwo?:PongPlayer;
	private rightPlayerOne?:PongPlayer;
	private rightPlayerTwo?:PongPlayer;

	constructor(privaetRoom:boolean = false)
	{
		const match = PongGameDoubles.createStandardGameDobules();
		super(privaetRoom, match);
		this.setMatchName("doubles match");
	}

	getLeftCaptain(): PongPlayer {
		if (this.leftPlayerOne === undefined)
			throw Error("Left player dont exist")
		return this.leftPlayerOne;
	}

	getRightCaptain(): PongPlayer {
		if (this.rightPlayerOne === undefined)
			throw Error("Left player dont exist")
		return this.rightPlayerOne;
	}

	getGameFrame() {
		this.getGame().getFrameDoubles();
	}

	isFull():boolean
	{
		if(this.leftPlayerOne !== undefined && this.leftPlayerTwo !== undefined
			&& this.rightPlayerOne !== undefined && this.rightPlayerTwo !== undefined)
		{
			return true;
		}
		return false
	}

	getMissingPlayerRole():EPlayerRoleFiltered
	{
		if(this.leftPlayerOne === undefined)
			return EPlayerRole.LEFT_ONE;
		else if(this.rightPlayerOne === undefined)
			return EPlayerRole.RIGHT_ONE;
		else if(this.leftPlayerTwo === undefined)
			return EPlayerRole.LEFT_TWO;
		else if(this.rightPlayerTwo === undefined)
			return EPlayerRole.RIGHT_TWO
		throw new Error("Room is full, no player is missing");
	}

	setMissingPlayer(player: PongPlayer): void
	{
		switch(player.getPlayerRole())
		{
			case EPlayerRole.LEFT_ONE:
			{
				this.setPlayer(player, this.leftPlayerOne);
				break;
			}
			case EPlayerRole.LEFT_TWO:
			{
				this.setPlayer(player, this.leftPlayerTwo);
				break;
			}
			case EPlayerRole.RIGHT_ONE:
			{
				this.setPlayer(player, this.rightPlayerOne)
				break;
			}
			case EPlayerRole.RIGHT_TWO:
			{
				this.setPlayer(player, this.rightPlayerTwo)
				break;
			}
			default:
			{
				throw new Error("Player role is unkown for setting");
			}
		}
	}

	removePlayer(player: PongPlayer): void
	{
		switch(player.getPlayerRole())
		{
			case EPlayerRole.LEFT_ONE:
			{
				this.unsetPlayer(this.leftPlayerOne);
				break;
			}
			case EPlayerRole.LEFT_TWO:
			{
				this.unsetPlayer(this.leftPlayerTwo);
				break;
			}
			case EPlayerRole.RIGHT_ONE:
			{
				this.unsetPlayer(this.rightPlayerOne)
				break;
			}
			case EPlayerRole.RIGHT_TWO:
			{
				this.unsetPlayer(this.rightPlayerTwo)
				break;
			}
			default:
			{
				throw new Error("Player role is unkown for unseting");
			}
		}
	}

	private setPlayer(player:PongPlayer, roomPlayer:PongPlayer | undefined)
	{
		if(roomPlayer !== undefined)
			throw Error("Trying to owerwrite LeftPlayerone");
		roomPlayer = player;
	}

	private unsetPlayer(roomPlayer:PongPlayer | undefined)
	{
		roomPlayer = undefined;
	}

}