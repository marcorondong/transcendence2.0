

export interface ScoreI
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

	startCountdown():void 
	{
		const interval = setInterval( ()=>
		{
			this.secondsLeft--;
			if(this.secondsLeft <= 0)
			{
				clearInterval(interval)
			}
		}, 1000);
	}
}