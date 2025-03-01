

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
	protected secondsLeft: number = 30;
	protected paused: boolean = false;

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