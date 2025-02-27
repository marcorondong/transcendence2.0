

interface ScoreI
{
	leftGoals: number;
	rightGoals: number;
	time: number | false;
}

export class ScoreBoard
{
	protected leftGoals:number = 0;
	protected rightGoals:number = 0;
	protected timeLeft: number | false = -1;

	constructor()
	{

	}

	score(side: "left" | "right")
	{
		if(side === "left")
			this.leftGoals++;
		else 
			this.rightGoals++;
	}

	getScoreJson():ScoreI
	{
		return {
			leftGoals: this.leftGoals,
			rightGoals: this.rightGoals,
			time: this.timeLeft
		}
	}
}