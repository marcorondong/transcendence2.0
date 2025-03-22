import { ETeamSide, ETeamSideFiltered } from "../PongPlayer";

export interface IScore
{
	leftGoals: number;
	rightGoals: number;
	time: number;
}

export class ScoreBoard
{
	protected leftPlayerGoals:number = 0;
	protected rightPlayerGoals:number = 0;
	protected secondsLeft: number = 15;
	protected paused: boolean = false;
	private lastScoredSide: "left" | "right" = "left";

	constructor()
	{

	}

	score(side: "left" | "right")
	{
		if(side === "left")
		{
			this.leftPlayerGoals++;
			this.lastScoredSide = "left";
		}
		else
		{
			this.rightPlayerGoals++;
			this.lastScoredSide="right";
		}
	}

	getWinnerSide(): ETeamSideFiltered
	{
		if(this.leftPlayerGoals > this.rightPlayerGoals)
			return ETeamSide.LEFT
		if(this.leftPlayerGoals === this.rightPlayerGoals)
		{
			throw Error("Not really winner, goals are same");
			// console.warn("Not really winner, should not happen")
			// return this.lastScoredSide;
		}
		return ETeamSide.RIGTH
	}

	getLoserSide(): ETeamSideFiltered
	{
		if(this.leftPlayerGoals < this.rightPlayerGoals)
			return ETeamSide.LEFT;
		if(this.leftPlayerGoals === this.rightPlayerGoals)
		{
			throw Error("Not really loser, goals are same");
			// console.warn("Not really winner, should not happen")
			// return this.lastScoredSide;
		}
		return ETeamSide.RIGTH

	}

	setScore(leftGoals:number, rightGoals:number)
	{
		this.leftPlayerGoals = leftGoals;
		this.rightPlayerGoals = rightGoals;
	}

	getScoreJson():IScore
	{
		return {
			leftGoals: this.leftPlayerGoals,
			rightGoals: this.rightPlayerGoals,
			time: this.secondsLeft
		}
	}

	startCountdown():void 
	{
		this.start();
		const interval = setInterval( ()=>
		{
			if(this.paused === false)
				this.secondsLeft--;
			if(this.secondsLeft <= 0)
			{
				clearInterval(interval)
			}
		}, 1000);
	}

	pause():void 
	{
		this.paused = true;
	}

	start():void 
	{
		this.paused = false;
	}

	isWinnerDecided():boolean
	{
		if(this.secondsLeft <= 0)
		{
			if(this.leftPlayerGoals !== this.rightPlayerGoals)
				return true;
		}
		return false
	}
}