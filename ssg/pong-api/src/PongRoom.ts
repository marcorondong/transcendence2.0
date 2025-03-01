import {SessionRoom} from "../../utils/SessionRoom"
import { PingPongGame } from "./PongGame";
import { Point } from "./Point";
import { Paddle } from "./Paddle";
import { Ball } from "./Ball";


function createGame(gameId:string) :PingPongGame
{
	const leftPaddle: Paddle = new Paddle(new Point(-4, 0));
	const rightPaddle: Paddle = new Paddle(new Point(4, 0));
	const ball: Ball = new Ball(new Point(0, 0));
	const game: PingPongGame = new PingPongGame(gameId, leftPaddle, rightPaddle, ball);
	return game;
}

export class PongRoom extends SessionRoom
{
	game:PingPongGame = createGame(this.id);
	constructor(roomID: string)
	{
		super(roomID, 2);
	}

	getGame():PingPongGame
	{
		return this.game;
	}
}