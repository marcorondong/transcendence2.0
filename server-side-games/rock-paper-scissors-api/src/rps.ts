//rps stands for Rock paper scisors 

export type RpsShape = "rock" | "paper" | "scissors";

function rockWin(player2: Choice): 1 | 2
{
	if (player2.getChoice() === "scissors")
		return 1
	return 2;
}

function paperWin(player2: Choice): 1 | 2
{
	if (player2.getChoice() === "rock")
		return 1
	return 2;
}

function scissorsWin(player2: Choice): 1 | 2
{
	if (player2.getChoice() === "paper")
		return 1
	return 2;
}

export class Choice
{
	private shape: RpsShape;

	constructor(shape: RpsShape)
	{
		this.shape = shape;
	}

	getChoice(): RpsShape 
	{
		return this.shape;
	}
}

export class RPSGame
{
	/**
	 * 
	 * @param player1 player 1 choice
	 * @param player2 player 2 choice
	 * @returns 1 if player 1 win, 2 if player 2 win, 0 if it is tie
	 */
	static getWinner(player1: Choice, player2: Choice):number
	{
		if(player1.getChoice() === player2.getChoice())
			return 0;
		const p1Move:RpsShape = player1.getChoice();
		switch(p1Move)
		{
			case "paper":
				return paperWin(player2);
			case "rock":
				return rockWin(player2);
			case "scissors":
				return scissorsWin(player2);
		}
	}
}