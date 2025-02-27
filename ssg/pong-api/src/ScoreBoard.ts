

export interface ScoreI
{
	leftGoals: number;
	rightGoals: number;
	time: number | false;
}

export class ScoreBoard
{
	protected leftPlayerGoals:number = 0;
	protected rightPlayerGoals:number = 0;
	protected secondsLeft: number | false = 60;

	constructor()
	{

	}

	score(side: "left" | "right")
	{
		if(side === "left")
			this.leftPlayerGoals++;
		else 
			this.rightPlayerGoals++;
	}

	getScoreJson():ScoreI
	{
		return {
			leftGoals: this.leftPlayerGoals,
			rightGoals: this.rightPlayerGoals,
			time: this.secondsLeft
		}
	}
}