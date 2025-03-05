import {SessionRoom} from "../../utils/SessionRoom"
import { Choice, RpsShape } from "./rps";
import { Player } from "../../utils/Player";
import { RPSGame } from "./rps";

export class RpsRoom extends SessionRoom
{
	moves:Map<Player, Choice> = new Map();
	constructor()
	{
		super();
	}

	storeMove(player:Player, playedMove:string)
	{
		const shape:RpsShape = Choice.stringToRpsShape(playedMove);
		const choice:Choice = new Choice(shape);
		this.moves.set(player, choice);
	}

	resetMoves()
	{
		this.moves.clear();
	}


	//TODO check if promise is good use case for this
	/**
	 * announce Winner if both player played moves, Otherwise do nothing 
	 * @returns 
	 */
	announceWinner()
	{
		if(this.moves.size < 2)
			return;
		const [[player1, choice1], [player2, choice2]] = this.moves.entries();
		const announcement = RPSGame.getWinnerAnnouncement(
		  { choice: choice1, player: player1 },
		  { choice: choice2, player: player2 }
		);
		this.roomBroadcast(announcement);
		this.resetMoves();
	}

}