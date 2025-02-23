import { Paddle } from "./Paddle";
import { Ball } from "./Ball";
import { VectorDirection, Point } from "./Point";

interface Position 
{
	x:number;
	y:number;
}

export interface PongFrameI
{
	leftPaddle: Position;
	rightPaddle: Position;
	ball: Position;
}

export class PingPongGame
{
	readonly id: string;
	protected leftPaddle: Paddle;
	protected rightPaddle: Paddle;
	protected ball: Ball;
	readonly CRITICAL_DISTANCE;
	
	readonly TABLE_WIDTH_Y: number = 5;
	readonly TABLE_LENGHT_X: number = 9;

	constructor(gameId:string, leftPaddle: Paddle, rightPaddle: Paddle, ball:Ball)
	{
		this.id = gameId;
		this.leftPaddle = leftPaddle;
		this.rightPaddle = rightPaddle;
		this.ball = ball;
		this.CRITICAL_DISTANCE= ball.getCriticalDistance();
	}

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
			},
		};
	}


	private isRightEdgeCritical(criticalDistance: number = this.CRITICAL_DISTANCE):boolean
	{
		const ballX = this.ball.getPosition().getX();
		const currentDistance = Math.abs(this.TABLE_LENGHT_X/2 - ballX);
		if(currentDistance <= criticalDistance)
			return true;
		return false;
	}

	private isLeftGoal():boolean
	{
		const ballHitPoints: Point[] = this.ball.getBallHitBoxPoints();
		for(const point of ballHitPoints)
		{
			if(point.getX() <= -1 * this.TABLE_LENGHT_X/2)
			{
				//this.ball.simpleBounceX();
				console.log("Left GOAL");
				this.ball.setPosition(new Point(0,0));
				console.log(PingPongGame.getPongFrame(this.leftPaddle, this.rightPaddle, this.ball));
				return true
			}
		}
		return false
	}

	private isRightGoal():boolean
	{
		const ballHitPoints: Point[] = this.ball.getBallHitBoxPoints();
		for(const point of ballHitPoints)
		{
			if(point.getX() >= this.TABLE_LENGHT_X/2)
			{
				this.ball.simpleBounceX();
				console.log("Right GOAL");
				this.ball.setPosition(new Point(0,0));
				console.log(PingPongGame.getPongFrame(this.leftPaddle, this.rightPaddle, this.ball));
				return true
			}
		}
		return false
	}

	private isLeftEdgeCritical(criticalDistance: number = this.CRITICAL_DISTANCE):boolean
	{
		const ballX = this.ball.getPosition().getX();
		const currentDistance = Math.abs( (-1 * this.TABLE_LENGHT_X/2) - ballX);
		if(currentDistance <= criticalDistance)
			return true;
		return false;
	}

	private isTopEdgeCritical(criticalDistance: number = this.CRITICAL_DISTANCE):boolean
	{
		const ballY = this.ball.getPosition().getY();
		const currentDistance = Math.abs(this.TABLE_WIDTH_Y/2 - ballY);
		if(currentDistance <= criticalDistance)
			return true;
		return false;
	}

	private isTopHit():boolean
	{
		const ballHitPoints: Point[] = this.ball.getBallHitBoxPoints();
		for(const point of ballHitPoints)
		{
			if(point.getY() >= this.TABLE_WIDTH_Y/2)
			{
				this.ball.simpleBounceY();
				console.log("Top hit");
				console.log(PingPongGame.getPongFrame(this.leftPaddle, this.rightPaddle, this.ball));
				return true
			}
		}
		return false
	}

	private isBottomHit():boolean
	{
		const ballHitPoints: Point[] = this.ball.getBallHitBoxPoints();
		for(const point of ballHitPoints)
		{
			if(point.getY() <= -1 * this.TABLE_WIDTH_Y/2)
			{
				this.ball.simpleBounceY();
				console.log("Bottom hit");
				console.log(PingPongGame.getPongFrame(this.leftPaddle, this.rightPaddle, this.ball));
				return true
			}
		}
		return false
	}

	private isBottomEdgeCritical(criticalDistance: number = this.CRITICAL_DISTANCE):boolean
	{
		const ballY = this.ball.getPosition().getY();
		const currentDistance = Math.abs( (-1 * this.TABLE_WIDTH_Y/2) - ballY);
		if(currentDistance <= criticalDistance)
			return true;
		return false;
	}

	private isBallInCriticalArea():boolean
	{
		if(this.isBottomEdgeCritical() || this.isTopEdgeCritical())
		{
			//console.log("critical area");
			//console.log(PingPongGame.getPongFrame(this.leftPaddle, this.rightPaddle, this.ball));
			this.isTopHit();
			this.isBottomHit();
			return true 
		}

		if(this.isLeftEdgeCritical() || this.isRightEdgeCritical())
		{
			console.log("Critical left right area");
			console.log(PingPongGame.getPongFrame(this.leftPaddle, this.rightPaddle, this.ball));
			//this.paddleBounce();
			this.isLeftGoal();
			this.isRightGoal();
			return true
		}
		return false
	}


	private paddleBounce()
	{
		const leftPaddleHitPoints = this.leftPaddle.getPaddleHitBoxPoints();
		const rightPaddleHitPoints = this.rightPaddle.getPaddleHitBoxPoints();

		for(const point of leftPaddleHitPoints)
		{
			if(this.ball.isHit(point) == true)
			{
				console.log("paddle hit left");
				this.ball.simpleBounceX();
			}
		}

		for(const point of rightPaddleHitPoints)
		{
			if(this.ball.isHit(point) == true)
			{
				console.log("paddle hti right");
				this.ball.simpleBounceX();
			}
		}
	}

	renderNextFrame()
	{
		this.isBallInCriticalArea();
		this.paddleBounce();
		this.ball.moveBall();
	}
}
