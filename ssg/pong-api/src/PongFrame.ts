import { Paddle } from "./Paddle";
import { Ball } from "./Ball";

interface Position 
{
	x:number;
	y:number;
}

interface PongFrameI
{
	leftPaddle: Position;
	rightPaddle: Position;
	ball: Position;
}

export class PongFrame
{
	static getPongFrame(leftPad: Paddle, rightPad: Paddle, ball: Ball): PongFrameI
	{
		return {
			leftPaddle: {
				x: leftPad.getPosition().getX(),
				y: leftPad.getPosition().getY(),
			}, 
			rightPaddle: 
			{
				x: rightPad.getPosition().getX(),
				y: rightPad.getPosition().getY(),
			},
			ball: 
			{
				x: ball.getPosition().getX(),
				y: ball.getPosition().getY(),
			}
		}
	}
}