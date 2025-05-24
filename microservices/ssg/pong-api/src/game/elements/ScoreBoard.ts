import { ETeamSide, ETeamSideFiltered } from "../PongPlayer";
import { scoreBoardConfig } from "../../config";

interface ITeamScore {
	goals: number;
	teamNickname: string;
}

export interface IScore {
	leftTeam: ITeamScore;
	rightTeam: ITeamScore;
	time: number;
}

export class ScoreBoard {
	private leftTeamNickname: string;
	private leftTeamGoals: number;
	private rightTeamGoals: number;
	private rightTeamNickname: string;
	private secondsLeft: number;
	private paused: boolean;
	private overtime: boolean;
	private lastScoredSide: "left" | "right";

	constructor() {
		this.leftTeamNickname = "Left Default Team Name";
		this.leftTeamGoals = 0;
		this.rightTeamGoals = 0;
		this.rightTeamNickname = "Right Default Team Name";
		this.secondsLeft = scoreBoardConfig.match_length;
		this.paused = false;
		this.overtime = false;
		this.lastScoredSide = "left";
	}

	isOvertime(): boolean {
		return this.overtime;
	}

	setLeftTeamNickname(leftTeamName: string) {
		this.leftTeamNickname = leftTeamName;
	}

	setRightTeamNickname(rightTeamName: string) {
		this.rightTeamNickname = rightTeamName;
	}

	score(side: "left" | "right") {
		if (side === "left") {
			this.leftTeamGoals++;
			this.lastScoredSide = "left";
		} else {
			this.rightTeamGoals++;
			this.lastScoredSide = "right";
		}
	}

	getWinnerSide(): ETeamSideFiltered {
		if (this.leftTeamGoals > this.rightTeamGoals) return ETeamSide.LEFT;
		if (this.leftTeamGoals === this.rightTeamGoals) {
			throw new Error("Not really winner, goals are same");
		}
		return ETeamSide.RIGHT;
	}

	getWinnerGoals(): number {
		if (this.leftTeamGoals > this.rightTeamGoals) return this.leftTeamGoals;
		return this.rightTeamGoals;
	}

	getLoserGoals(): number {
		if (this.leftTeamGoals < this.rightTeamGoals) return this.leftTeamGoals;
		return this.rightTeamGoals;
	}

	getLoserSide(): ETeamSideFiltered {
		if (this.leftTeamGoals < this.rightTeamGoals) return ETeamSide.LEFT;
		if (this.leftTeamGoals === this.rightTeamGoals) {
			throw new Error("Not really loser, goals are same");
		}
		return ETeamSide.RIGHT;
	}

	setScore(leftGoals: number, rightGoals: number) {
		this.leftTeamGoals = leftGoals;
		this.rightTeamGoals = rightGoals;
	}

	getScoreJson(): IScore {
		return {
			leftTeam: {
				goals: this.leftTeamGoals,
				teamNickname: this.leftTeamNickname,
			},
			rightTeam: {
				goals: this.rightTeamGoals,
				teamNickname: this.rightTeamNickname,
			},
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
			if (this.leftTeamGoals !== this.rightTeamGoals) return true;
		}
		return false;
	}

	getLeftPlayerGoals(): number {
		return this.leftTeamGoals;
	}

	getRightPlayerGoals(): number {
		return this.rightTeamGoals;
	}
}
