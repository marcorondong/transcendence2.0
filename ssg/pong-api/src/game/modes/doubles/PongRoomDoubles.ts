import { APongRoom } from "../../APongRoom";
import { ETeamSide, PongPlayer } from "../../PongPlayer";
import { IPongFrameDoubles, PongGameDoubles } from "./PongGameDoubles";
import { EPlayerRoleFiltered, EPlayerRole } from "../../PongPlayer";

export class PongRoomDoubles extends APongRoom<PongGameDoubles> {
	private leftPlayerOne?: PongPlayer;
	private leftPlayerTwo?: PongPlayer;
	private rightPlayerOne?: PongPlayer;
	private rightPlayerTwo?: PongPlayer;

	constructor(privateRoom: boolean = false) {
		const match = PongGameDoubles.createStandardGameDoubles();
		super(privateRoom, match);
		this.setMatchName("doubles match");
	}

	updateOthers(message: string): void {
		this.broadcastLobbyUpdate(message);
	}

	broadcastLobbyUpdate(extraInfo: string): void {
		if (this.leftPlayerOne !== undefined)
			this.sendLobbyUpdate(this.leftPlayerOne, extraInfo);
		if (this.rightPlayerOne !== undefined)
			this.sendLobbyUpdate(this.rightPlayerOne, extraInfo);
		if (this.leftPlayerTwo !== undefined)
			this.sendLobbyUpdate(this.leftPlayerTwo, extraInfo);
		if (this.rightPlayerTwo !== undefined)
			this.sendLobbyUpdate(this.rightPlayerTwo, extraInfo);
	}

	putTeamNameOnScoreBoard(player: PongPlayer): void {
		const teamSide = player.getTeamSideLR();
		if (teamSide === ETeamSide.LEFT) {
			if (this.leftPlayerOne && this.leftPlayerTwo) {
				this.getGame()
					.getScoreBoard()
					.setLeftTeamNickname(
						this.makeTeamName(
							this.leftPlayerOne.getPlayerNickname(),
							this.leftPlayerTwo.getPlayerNickname(),
						),
					);
			}
		} else if (teamSide === ETeamSide.RIGHT) {
			if (this.rightPlayerOne && this.rightPlayerTwo) {
				this.getGame()
					.getScoreBoard()
					.setRightTeamNickname(
						this.makeTeamName(
							this.rightPlayerOne.getPlayerNickname(),
							this.rightPlayerTwo.getPlayerNickname(),
						),
					);
			}
		}
	}

	isEmpty(): boolean {
		if (
			this.leftPlayerOne === undefined &&
			this.leftPlayerTwo === undefined &&
			this.rightPlayerOne === undefined &&
			this.rightPlayerTwo == undefined
		)
			return true;
		return false;
	}

	calculateMissingPlayers(): number {
		let counter = 0;
		if (this.leftPlayerOne === undefined) counter++;
		if (this.rightPlayerOne === undefined) counter++;
		if (this.leftPlayerTwo === undefined) counter++;
		if (this.rightPlayerTwo === undefined) counter++;
		return counter;
	}

	getLeftCaptain(): PongPlayer {
		if (this.leftPlayerOne === undefined)
			throw Error("Left player don`t exist");
		return this.leftPlayerOne;
	}

	getRightCaptain(): PongPlayer {
		if (this.rightPlayerOne === undefined)
			throw Error("Right player don`t exist");
		return this.rightPlayerOne;
	}

	getGameFrame(): IPongFrameDoubles {
		return this.getGame().getFrameDoubles();
	}

	isFull(): boolean {
		if (
			this.leftPlayerOne !== undefined &&
			this.leftPlayerTwo !== undefined &&
			this.rightPlayerOne !== undefined &&
			this.rightPlayerTwo !== undefined
		) {
			return true;
		}
		return false;
	}

	getMissingPlayerRole(): EPlayerRoleFiltered {
		if (this.leftPlayerOne === undefined) return EPlayerRole.LEFT_ONE;
		else if (this.rightPlayerOne === undefined)
			return EPlayerRole.RIGHT_ONE;
		else if (this.leftPlayerTwo === undefined) return EPlayerRole.LEFT_TWO;
		else if (this.rightPlayerTwo === undefined)
			return EPlayerRole.RIGHT_TWO;
		throw new Error("Room is full, no player is missing");
	}

	setMissingPlayer(player: PongPlayer): void {
		switch (player.getPlayerRole()) {
			case EPlayerRole.LEFT_ONE: {
				this.setLeftOnePlayer(player);
				break;
			}
			case EPlayerRole.LEFT_TWO: {
				this.setLeftTwoPlayer(player);
				break;
			}
			case EPlayerRole.RIGHT_ONE: {
				this.setRightOnePlayer(player);
				break;
			}
			case EPlayerRole.RIGHT_TWO: {
				this.setRightTwoPlayer(player);
				break;
			}
			default: {
				throw new Error("Player role is unknown for setting");
			}
		}
	}

	removePlayer(player: PongPlayer): void {
		switch (player.getPlayerRole()) {
			case EPlayerRole.LEFT_ONE: {
				this.leftPlayerOne = undefined;
				return;
			}
			case EPlayerRole.RIGHT_ONE: {
				this.rightPlayerOne = undefined;
				return;
			}
			case EPlayerRole.LEFT_TWO: {
				this.leftPlayerTwo = undefined;
				return;
			}
			case EPlayerRole.RIGHT_TWO: {
				this.rightPlayerTwo = undefined;
				return;
			}
		}
	}

	private setLeftOnePlayer(player: PongPlayer): void {
		if (this.leftPlayerOne !== undefined)
			throw new Error("Trying to overwrite left player one");
		this.leftPlayerOne = player;
	}

	private setLeftTwoPlayer(player: PongPlayer): void {
		if (this.leftPlayerTwo !== undefined)
			throw new Error("Trying to overwrite left player two");
		this.leftPlayerTwo = player;
	}

	private setRightOnePlayer(player: PongPlayer): void {
		if (this.rightPlayerOne !== undefined)
			throw new Error("Trying to overwrite right player one");
		this.rightPlayerOne = player;
	}

	private setRightTwoPlayer(player: PongPlayer): void {
		if (this.rightPlayerTwo !== undefined)
			throw new Error("Trying to overwrite right player two");
		this.rightPlayerTwo = player;
	}

	private makeTeamName(
		firstNickname: string,
		secondNickname: string,
	): string {
		return firstNickname + "-" + secondNickname + "-TEAM";
	}
}
