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

	getFrame()
	{
		return PingPongGame.getPongFrame(this.leftPaddle, this.rightPaddle, this.ball);
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



	private isTopHit(ballPoint:Point):boolean
	{
		if(ballPoint.getY() >= this.TABLE_WIDTH_Y/2)
		{
			return true
		}
		return false
	}

	private isBottomHit(ballPoint:Point):boolean
	{
		if(ballPoint.getY() <= -1 * this.TABLE_WIDTH_Y/2)
		{
			return true
		}
		return false
	}

	private isBounceEdge(side: "top" | "bottom"):boolean 
	{
		const ballHitPoints: Point[] = this.ball.getBallHitBoxPoints();
		let result = false;
		for(const point of ballHitPoints)
		{
			if(side === "top")
			{
				result = this.isTopHit(point)
			}
			else 
			{
				result = this.isBottomHit(point);
			}
		}
		return result;
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
			console.log("near TOP or bottom");
			if(this.isBounceEdge("top") === true || this.isBounceEdge("bottom"))
			{
				this.ball.simpleBounceY();
			}
		}
		if(this.isObstacleNear(RightEdgePoint)  ||  this.isObstacleNear(LeftEdgePoint))
		{
			this.isGoal();
		}
		if(this.isObstacleNear(this.leftPaddle.getPosition(), this.leftPaddle.height + this.ball.getRadius()))
		{
			this.paddleBounce(this.leftPaddle);
		}
		if(this.isObstacleNear(this.rightPaddle.getPosition(), this.rightPaddle.height + this.ball.getRadius()))
			this.paddleBounce(this.rightPaddle);
	}


	private paddleBounce(paddle:Paddle)
	{
		const paddleHitPoints = paddle.getPaddleHitBoxPoints();
		for(const point of paddleHitPoints)
		{
			if(this.ball.isHit(point) == true)
			{
				this.ball.simpleBounceX();
			}
		}
	}

	renderNextFrame()
	{
		this.isBallInCriticalArea();
		this.ball.moveBall();
	}
}
