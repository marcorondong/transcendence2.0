import { ETeamSide, ETeamSideFiltered } from "../PongPlayer";
import { scoreBoardConfig } from "../../../config";

export interface IScore {
	leftGoals: number;
	rightGoals: number;
	time: number;
}

export class ScoreBoard {
	private leftPlayerGoals: number;
	private rightPlayerGoals: number;
	private secondsLeft: number;
	private paused: boolean;
	private overtime: boolean;
	private lastScoredSide: "left" | "right";

	constructor() {
		this.leftPlayerGoals = 0;
		this.rightPlayerGoals = 0;
		this.secondsLeft = scoreBoardConfig.match_length;
		this.paused = false;
		this.overtime = false;
		this.lastScoredSide = "left";
	}

	isOvertime(): boolean {
		return this.overtime;
	}

	score(side: "left" | "right") {
		if (side === "left") {
			this.leftPlayerGoals++;
			this.lastScoredSide = "left";
		} else {
			this.rightPlayerGoals++;
			this.lastScoredSide = "right";
		}
	}

	getWinnerSide(): ETeamSideFiltered {
		if (this.leftPlayerGoals > this.rightPlayerGoals) return ETeamSide.LEFT;
		if (this.leftPlayerGoals === this.rightPlayerGoals) {
			throw Error("Not really winner, goals are same");
		}
		return ETeamSide.RIGHT;
	}

	//TODO: remove this once the proper id is implemented
	getWinnerSideString(): string
	{
		const winnerSide:ETeamSideFiltered = this.getWinnerSide();
		if(winnerSide == ETeamSide.LEFT)
			return "Left Player ID";
		return "Right Player ID";
	}

	//TODO: remove this once the proper id is implemented
	getLoserSideString(): string
	{
		const loserSide:ETeamSideFiltered = this.getLoserSide();
		if(loserSide == ETeamSide.LEFT)
			return "Left Player ID";
		return "Right Player ID";
	}

	getWinnerGoals(): number
	{
		if(this.leftPlayerGoals > this.rightPlayerGoals)
			return this.leftPlayerGoals;
		return this.rightPlayerGoals;
	}

	getLoserGoals(): number
	{
		if(this.leftPlayerGoals < this.rightPlayerGoals)
			return this.leftPlayerGoals;
		return this.rightPlayerGoals;
	}

	getLoserSide(): ETeamSideFiltered {
		if (this.leftPlayerGoals < this.rightPlayerGoals) return ETeamSide.LEFT;
		if (this.leftPlayerGoals === this.rightPlayerGoals) {
			throw Error("Not really loser, goals are same");
		}
		return ETeamSide.RIGHT;
	}

	setScore(leftGoals: number, rightGoals: number) {
		this.leftPlayerGoals = leftGoals;
		this.rightPlayerGoals = rightGoals;
	}

	getScoreJson(): IScore {
		return {
			leftGoals: this.leftPlayerGoals,
			rightGoals: this.rightPlayerGoals,
			time: this.secondsLeft,
		};
	}

	startCountdown(): void {
		this.start();
		const interval = setInterval(() => {
			if (this.paused === false) this.secondsLeft--;
			if (this.secondsLeft <= 0) {
				this.overtime = true;
				clearInterval(interval);
			}
		}, 1000);
	}

	pause(): void {
		this.paused = true;
	}

	start(): void {
		this.paused = false;
	}

	isWinnerDecided(): boolean {
		if (this.secondsLeft <= 0) {
			if (this.leftPlayerGoals !== this.rightPlayerGoals) return true;
		}
		return false;
	}

	getLeftPlayerGoals(): number {
		return this.leftPlayerGoals;
	}

	getRightPlayerGoals(): number {
		return this.rightPlayerGoals;
	}
}
