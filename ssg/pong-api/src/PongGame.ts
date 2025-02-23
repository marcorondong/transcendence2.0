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

	private isObstacleNear(obstaclePoint:Point,criticalDistance: number = this.CRITICAL_DISTANCE):boolean
	{
		const currentDistance = Point.calculateDistance(obstaclePoint, this.ball.getPosition());
		if(currentDistance <= criticalDistance)
			return true;
		return false;
	}

	private scoredGoal(goalSide: "left" | "right"): void
	{
		console.log(`${goalSide} GOAL scored`);
		this.ball.setPosition(new Point(0,0));
		console.log(PingPongGame.getPongFrame(this.leftPaddle, this.rightPaddle, this.ball));
	}
	
	private isLeftGoal(BallPoint:Point):boolean
	{
		if(BallPoint.getX() <= (-1 * this.TABLE_LENGHT_X / 2))
		{
			this.scoredGoal("left");
			return true;
		}
		return false
	}
	
	private isRightGoal(BallPoint:Point):boolean
	{
		if(BallPoint.getX() >= this.TABLE_LENGHT_X/2)
		{
			this.scoredGoal("right");
			return true;
		}
		return false
	}

	private isGoal():boolean
	{
		const ballHitPoints: Point[] = this.ball.getBallHitBoxPoints();
		const vectorDir:VectorDirection = this.ball.getBallDirection();
		for(const point of ballHitPoints)
		{
			if(vectorDir === VectorDirection.RIGHT || vectorDir === VectorDirection.RIGHT_DOWN || vectorDir ===VectorDirection.RIGHT_UP)
			{
				return this.isRightGoal(point);
			}
			else if(vectorDir === VectorDirection.LEFT || vectorDir === VectorDirection.LEFT_DOWN || vectorDir ===VectorDirection.LEFT_UP)
			{
				return this.isLeftGoal(point);
			}
		}
		return false
	}



	private isTopHit():boolean
	{
		const ballHitPoints: Point[] = this.ball.getBallHitBoxPoints();
		for(const point of ballHitPoints)
		{
			if(point.getY() >= this.TABLE_WIDTH_Y/2)
			{
				this.ball.simpleBounceY();
				//TODO remove this
				// console.log("Top hit");
				// console.log(PingPongGame.getPongFrame(this.leftPaddle, this.rightPaddle, this.ball));
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
				//TODO remove this
				// console.log("Bottom hit");
				// console.log(PingPongGame.getPongFrame(this.leftPaddle, this.rightPaddle, this.ball));
				return true
			}
		}
		return false
	}


	private isBallInCriticalArea():void
	{
		const ballX = this.ball.getPosition().getX();
		const ballY = this.ball.getPosition().getY();

		const topEdgeY = this.TABLE_WIDTH_Y/2;
		const bottomEdgeY = (this.TABLE_WIDTH_Y/2) * (-1);

		const rightEdgeX = this.TABLE_LENGHT_X/2;
		const leftEdgeX = (this.TABLE_LENGHT_X/2) * (-1);

		const topEdgePoint:Point = new Point(ballX, topEdgeY);
		const bottomEdgePoint:Point = new Point(ballX, bottomEdgeY);

		const LeftEdgePoint:Point = new Point(leftEdgeX, ballY);
		const RightEdgePoint:Point = new Point(rightEdgeX, ballY);
		if(this.isObstacleNear(topEdgePoint)  ||  this.isObstacleNear(bottomEdgePoint))
		{
			this.isTopHit();
			this.isBottomHit();
			//return true 
		}
		if(this.isObstacleNear(RightEdgePoint)  ||  this.isObstacleNear(LeftEdgePoint))
		{
			console.log("Critical left right area");
			//TODO remove this
			//console.log(PingPongGame.getPongFrame(this.leftPaddle, this.rightPaddle, this.ball));
			this.isGoal();
			//return true
		}
		if(this.isObstacleNear(this.leftPaddle.getPosition(), this.leftPaddle.height + this.ball.getRadius()))
		{
			console.log("near left");
			this.paddleBounce();
		}
		if(this.isObstacleNear(this.rightPaddle.getPosition(), this.rightPaddle.height + this.ball.getRadius()))
			this.paddleBounce();
		//return false
	}


	private paddleBounce()
	{
		const leftPaddleHitPoints = this.leftPaddle.getPaddleHitBoxPoints();
		const rightPaddleHitPoints = this.rightPaddle.getPaddleHitBoxPoints();

		for(const point of leftPaddleHitPoints)
		{
			if(this.ball.isHit(point) == true)
			{
				console.log(this.leftPaddle.getPosition());
				console.log("paddle hit left");
				//console.log(point);
				this.ball.simpleBounceX();
			}
		}

		for(const point of rightPaddleHitPoints)
		{
			if(this.ball.isHit(point) == true)
			{
				//console.log("paddle hit right");
				//console.log(point);
				this.ball.simpleBounceX();
			}
		}
	}

	renderNextFrame()
	{
		this.isBallInCriticalArea();
		//this.paddleBounce();
		this.ball.moveBall();
	}
}
