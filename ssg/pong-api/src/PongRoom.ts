import {SessionRoom} from "../../utils/SessionRoom"
import { PingPongGame } from "./PongGame";
import { Point } from "./Point";
import { Paddle } from "./Paddle";
import { Ball } from "./Ball";
import { PongFrameI } from "./PongGame";
import raf from "raf";
import { WebSocket, RawData } from "ws";
import {Parser} from "../../utils/Parser"


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

	assingControlsToPlayer(socket: WebSocket, paddleSide: "left" | "right"):void 
	{
		socket.on("message", (data: RawData, isBinnary:boolean) =>
		{
			const json = Parser.rawDataToJson(data);
			if(!json)
			{
				socket.send("Invalid json");
				return 
			}
			const direction = json.move;
			const paddle:Paddle = this.getGame().getPaddle(paddleSide);
			this.getGame().movePaddle(paddle, direction);
		})
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