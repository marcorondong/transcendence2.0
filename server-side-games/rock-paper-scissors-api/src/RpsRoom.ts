import {SessionRoom} from "../../utils/SessionRoom"
import { Choice, RpsShape } from "./rps";
import { Player } from "../../utils/Player";
import { RPSGame } from "./rps";

export class RpsRoom extends SessionRoom
{
	moves:Map<Player, Choice> = new Map();
	constructor(roomId: string)
	{
		super(roomId, 2);
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
		const [[key1, value1], [key2, value2]] = this.moves.entries();
		const annoucement = RPSGame.getWinnerAnnouncement(value1, value2);
		this.roomBroadcast(annoucement);
		this.resetMoves();
	}

}