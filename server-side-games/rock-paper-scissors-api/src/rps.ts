//rps stands for Rock paper scisors 

export type RpsShape = "rock" | "paper" | "scissors" | "invalid";

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

	static stringToRpsShape(move:string):RpsShape
	{
		const cleanedString = move.trim().toLowerCase().replace(/\s+/g, ""); //lowercase and remove all spaces
		if(cleanedString !== "paper" && cleanedString !== "rock" && cleanedString !== "scissors")
			return "invalid";
		return cleanedString;
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
	static getWinner(player1: Choice, player2: Choice): 1 | 2 | 0
	{
		if(player1.getChoice() === player2.getChoice())
			return 0;
		if(player1.getChoice() === "invalid")
			return 2;
		if(player2.getChoice() === "invalid")
			return 1;
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
		throw Error("Edge case that is not covered in getWinner function. Should not be printed");
	}

	static getWinnerAnnouncement(player1: Choice, player2: Choice):string
	{
		const winner = this.getWinner(player1, player2);
		let annoucement; 
		switch (winner)
		{
			case 1:
				annoucement = `Winner is player 1. ${player1.getChoice()} wins over ${player2.getChoice()}`
				break;
			case 2:
				annoucement = `Winner is player 2. ${player2.getChoice()} wins over ${player1.getChoice()}`
				break;
			case 0:
				annoucement = `It is draw. ${player1.getChoice()} vs ${player2.getChoice()}`
				break;
		}
		return annoucement;
	}
}