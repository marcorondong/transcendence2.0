import { Paddle } from "./Paddle";
import { Ball } from "./Ball";
import { VectorDirection, Point } from "./Point";
import { ScoreBoard, ScoreI} from "./ScoreBoard";
import raf from 'raf' //raf is request animation frame

interface Position 
{
	x:number;
	y:number;
}

export interface PongFrameI
{
	leftPaddle: Position & {height:number};
	rightPaddle: Position & {height:number};
	ball: Position & { radius: number };
	score: ScoreI;
}

export class PingPongGame
{
	readonly id: string;
	protected leftPaddle: Paddle;
	protected rightPaddle: Paddle;
	protected ball: Ball;
	readonly CRITICAL_DISTANCE;
	private lastFrameTime: number = 0;
	private gameStatus : "running" | "paused" | "finished" = "running"
	
	readonly score:ScoreBoard = new ScoreBoard();
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

	static getPongFrame(leftPad: Paddle, rightPad: Paddle, ball: Ball, score:ScoreBoard): PongFrameI
	{
		return {
			leftPaddle: {
				x: leftPad.getPosition().getX(),
				y: leftPad.getPosition().getY(),
				height: leftPad.height
			}, 
			rightPaddle: 
			{
				x: rightPad.getPosition().getX(),
				y: rightPad.getPosition().getY(),
				height: rightPad.height
			},
			ball: 
			{
				x: ball.getPosition().getX(),
				y: ball.getPosition().getY(),
				radius: ball.getRadius()
			},
			score: score.getScoreJson()
		};
	}

	getGameStatus(): "running" | "paused" | "finished"
	{
		return this.gameStatus;
	}

	pauseGame(): void
	{
		this.gameStatus = "paused";
		this.score.pause();
	}

	startGame(): void 
	{
		this.gameStatus = "running"
		this.score.start();
	}

	finishGame():void 
	{
		this.gameStatus = "finished"
	}

	getFrame()
	{
		return PingPongGame.getPongFrame(this.leftPaddle, this.rightPaddle, this.ball, this.score);
	}


	movePaddle(paddle:Paddle, direction: "up" | "down")
	{
		if(this.isPaddleMoveAllowed(paddle,direction) && this.gameStatus === "running")
			paddle.move(direction);
	}


	private isPaddleMoveAllowed(paddle:Paddle, direction: "up" | "down"):boolean
	{
		const maxY = this.TOP_EDGE_Y + (0.45) * paddle.height;
		const minY = this.BOTTOM_EDGE_Y - (0.45) * paddle.height;
		let move_modifier = paddle.getMoveModifier();
		if(direction === "down")
			move_modifier *= -1;
		const newPaddleY = paddle.getPosition().getY() + move_modifier;
		if(newPaddleY >= maxY)
			return false
		if(newPaddleY <= minY)
			return false;
		return true;
	}

	private renderNextFrame()
	{
		this.ballMovementMechanics();
		this.ball.moveBall();
		if(this.score.isWinnerDecided() === true)
			this.finishGame();
	}

	private start(): void 
	{
		this.score.startCountdown();
		raf((timestamp:number)=> this.gameLoop(timestamp))
	}

	private gameLoop(timestamp: number):void 
	{
		if(this.gameStatus === "running")
		{
			const deltaTime = timestamp - this.lastFrameTime;
			this.lastFrameTime = timestamp;
			this.renderNextFrame();
		}
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
		let strikerSide: "left" | "right";
		if(goalSide === "left")
			strikerSide = "right";
		else 
			strikerSide = "left"
		this.score.score(strikerSide);
		this.ball.setPosition(new Point(0,0));
		this.ball.resetDirection();
		this.leftPaddle.resetPosition();
		this.rightPaddle.resetPosition();
	}
	
	private isLeftGoal(BallPoint:Point):boolean
	{
		if(BallPoint.getX() < this.LEFT_EDGE_X)
		{
			return true;
		}
		return false
	}
	
	private isRightGoal(BallPoint:Point):boolean
	{
		if(BallPoint.getX() > this.RIGHT_EDGE_X)
		{
			return true;
		}
		return false
	}

	private isGoal():boolean
	{
		const vectorDir:VectorDirection = this.ball.getBallDirection();

		if(this.ball.isMovingRight())
		{
			return this.isRightGoal(this.ball.getPosition());
		}
		else if(this.ball.isMovingLeft())
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


	private topEdgeCollision(): boolean
	{
		const ballX = this.ball.getPosition().getX();
		const topEdgePoint:Point = new Point(ballX, this.TOP_EDGE_Y);
		if(this.ball.isMovingUp() && this.isObstacleNear(topEdgePoint))
		{
			if(this.isBounceEdge("top"))
			{
				return true;
			}
		}
		return false
	}

	private bottomEdgeCollision():boolean
	{
		const ballX = this.ball.getPosition().getX();
		const bottomEdgePoint:Point = new Point(ballX, this.BOTTOM_EDGE_Y);
		if(this.ball.isMovingDown() && this.isObstacleNear(bottomEdgePoint))
		{
			if(this.isBounceEdge("bottom"))
			{
				return true;
			}
		}
		return false
	}


	private sideMechanics(side: "left" | "right"):void 
	{
		const ballY = this.ball.getPosition().getY();
		let paddle:Paddle; 
		let edgeX;
		if(side === "left")
		{
			edgeX = this.LEFT_EDGE_X;
			paddle = this.leftPaddle;
		}
		else
		{
			edgeX = this.RIGHT_EDGE_X;
			paddle = this.rightPaddle;
		}
		const EdgePoint:Point = new Point(edgeX, ballY);
		const impactPointPaddle:Point | false = this.paddleBounce(paddle, this.ball.getDirection().getX());
		if(impactPointPaddle !== false)
		{
			const bounceDir:Point = this.ball.caluclateComplexBounceDirection(paddle.getPosition(), paddle.height);
			return this.ball.setDirection(bounceDir);
		}
		if(this.isObstacleNear(EdgePoint) && (this.isGoal()))
			return this.scoredGoal(side);
	}

	private ballMovementMechanics():void
	{
		if(this.topEdgeCollision() || this.bottomEdgeCollision())
			return this.ball.simpleBounceY();
		if(this.ball.isMovingLeft())
		{
			return this.sideMechanics("left");
		}
		if(this.ball.isMovingRight())
		{
			return this.sideMechanics("right");
		}
	}

	/**
	 * 
	 * @param paddle 
	 * @returns either false or Point it hits
	 */
	private paddleBounce(paddle:Paddle, ballDirectionX:number): false | Point
	{
		const paddleHitPoints = paddle.getPaddleHitBoxPoints(ballDirectionX);
		for(const point of paddleHitPoints)
		{
			if(this.ball.isHit(point) == true)
			{
				return point;
			}
		}
		return false;
	}
}
