import {SessionRoom} from "../../utils/SessionRoom"
import { PingPongGame } from "./PongGame";
import { Point } from "./Point";
import { Paddle } from "./Paddle";
import { Ball } from "./Ball";
import { PongFrameI } from "./PongGame";
import raf from "raf";


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
	private isFrameGenerating: boolean = false;

	game:PingPongGame = createGame(this.id);
	constructor(roomID: string)
	{
		super(roomID, 2);
	}

	getGame():PingPongGame
	{
		return this.game;
	}


	/**
	 * function that make sure frame are generated only once. This fixed performance bug
	 */
	getAndSendFramesOnce() {
		if(this.isFrameGenerating === false)
		{
			this.isFrameGenerating = true;
			this.sendFrames();
		}
	}

	private sendFrames()
	{
		const renderFrame = () => {
			const frame: PongFrameI = this.getGame().getFrame();
			const frameJson = JSON.stringify(frame);
			this.roomBroadcast(frameJson)
			if(this.getGame().isLastFrame())
			{
				return;
			}
			raf(renderFrame);
		};
		raf(renderFrame);
	}
}