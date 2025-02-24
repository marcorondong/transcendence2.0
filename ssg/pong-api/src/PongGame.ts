import { Paddle } from "./Paddle";
import { Ball } from "./Ball";
import { VectorDirection, Point } from "./Point";
import raf from 'raf' //raf is request animation frame

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
	private lastFrameTime: number = 0;
	
	readonly TABLE_WIDTH_Y: number = 5;
	readonly TABLE_LENGHT_X: number = 9;
	readonly TOP_EDGE_Y:number = this.TABLE_WIDTH_Y/2;
	readonly BOTTOM_EDGE_Y:number = (this.TABLE_WIDTH_Y/2) * (-1);
	readonly RIGHT_EDGE_X = this.TABLE_LENGHT_X/2;
	readonly LEFT_EDGE_X = (this.TABLE_LENGHT_X/2) * (-1);

	constructor(gameId:string, leftPaddle: Paddle, rightPaddle: Paddle, ball:Ball)
	{
		this.id = gameId;
		this.leftPaddle = leftPaddle;
		this.rightPaddle = rightPaddle;
		this.ball = ball;
		this.CRITICAL_DISTANCE= ball.getCriticalDistance();
		this.start();
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

	private renderNextFrame()
	{
		this.isBallInCriticalArea();
		this.ball.moveBall();
	}

	private start(): void 
	{
		raf((timestamp:number)=> this.gameLoop(timestamp))
	}

	private gameLoop(timestamp: number):void 
	{
		const deltaTime = timestamp - this.lastFrameTime;
		this.lastFrameTime = timestamp;
		this.renderNextFrame();
		raf((timestamp:number)=> this.gameLoop(timestamp))
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
		this.ball.setPosition(new Point(0,0));
	}
	
	private isLeftGoal(BallPoint:Point):boolean
	{
		if(BallPoint.getX() < this.LEFT_EDGE_X)
		{
			this.scoredGoal("left");
			return true;
		}
		return false
	}
	
	private isRightGoal(BallPoint:Point):boolean
	{
		if(BallPoint.getX() > this.RIGHT_EDGE_X)
		{
			this.scoredGoal("right");
			return true;
		}
		return false
	}

	private isGoal():boolean
	{
		const vectorDir:VectorDirection = this.ball.getBallDirection();

		if(vectorDir === VectorDirection.RIGHT || vectorDir === VectorDirection.RIGHT_DOWN || vectorDir ===VectorDirection.RIGHT_UP)
		{
			return this.isRightGoal(this.ball.getPosition());
		}
		else if(vectorDir === VectorDirection.LEFT || vectorDir === VectorDirection.LEFT_DOWN || vectorDir ===VectorDirection.LEFT_UP)
		{
			return this.isLeftGoal(this.ball.getPosition());
		}
		return false
	}

	/**
	 * 
	 * @param ballPoint (usually up point of ball)
	 * @returns true if ball point touches the top of field
	 */
	private isTopHit(ballPoint:Point):boolean
	{
		if(ballPoint.getY() >= this.TOP_EDGE_Y)
		{
			console.log("Point that hit top");
			console.log(ballPoint);
			return true
		}
		return false
	}

		/**
	 * 
	 * @param ballPoint (usually down point of ball)
	 * @returns true if ball point touches the top of field
	 */
	private isBottomHit(ballPoint:Point):boolean
	{
		if(ballPoint.getY() <= this.BOTTOM_EDGE_Y)
		{
			return true
		}
		return false
	}

	private isBounceEdge(side: "top" | "bottom"):boolean 
	{
		const ballHitPoints: Map<VectorDirection, Point> = this.ball.getBallHitBoxPoints();
		let result = false;
		if(side === "top")
		{
			const topPoint = ballHitPoints.get(VectorDirection.UP);
			if(topPoint !== undefined)
				result = this.isTopHit(topPoint)
			else 
				result = false;
		}
		else 
		{
			const bottomPoint = ballHitPoints.get(VectorDirection.DOWN);
			if(bottomPoint !== undefined)
				result = this.isBottomHit(bottomPoint)
			else 
				result = false;
		}
		return result;
	}

	private isBallInCriticalArea():void
	{
		const ballX = this.ball.getPosition().getX();
		const ballY = this.ball.getPosition().getY();

		const topEdgePoint:Point = new Point(ballX, this.TOP_EDGE_Y);
		const bottomEdgePoint:Point = new Point(ballX, this.BOTTOM_EDGE_Y);

		const LeftEdgePoint:Point = new Point(this.LEFT_EDGE_X, ballY);
		const RightEdgePoint:Point = new Point(this.RIGHT_EDGE_X, ballY);
		if(this.isObstacleNear(topEdgePoint)  ||  this.isObstacleNear(bottomEdgePoint))
		{
			if(this.isBounceEdge("top") === true || this.isBounceEdge("bottom")=== true)
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
}
