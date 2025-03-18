import { Paddle } from "./Paddle";
import { Ball } from "./Ball";
import { VectorDirection, Point } from "./Point";
import { ScoreBoard, ScoreI} from "./ScoreBoard";
import raf from 'raf' //raf is request animation frame
import { error } from "console";
import { PongField } from "./PongField";
import { EventEmitter } from "stream";
import { GameEvents } from "../customEvents";
import { EPlayerSide } from "../PongPlayer";

interface Position 
{
	x:number;
	y:number;
}

export enum EGameStatus
{
	NOT_STARTED,
	RUNNING,
	PAUSED, 
	FINISHED
}

export interface IPongFrame
{
	leftPaddle: Position & {height:number};
	rightPaddle: Position & {height:number};
	ball: Position & { radius: number };
	score: ScoreI;
	matchStatus: EGameStatus
}

export class PongGame extends EventEmitter
{

	protected leftPaddle: Paddle;
	protected rightPaddle: Paddle;
	protected ball: Ball;
	readonly score:ScoreBoard;
	readonly field:PongField;


	readonly CRITICAL_DISTANCE;
	private lastFrameTime: number = 0;
	private gameStatus:EGameStatus;
	
	constructor(leftPaddle: Paddle, rightPaddle: Paddle, ball:Ball, score:ScoreBoard, tableField:PongField)
	{
		super();
		this.leftPaddle = leftPaddle;
		this.rightPaddle = rightPaddle;
		this.ball = ball;
		this.CRITICAL_DISTANCE = ball.getCriticalDistance();
		this.score = score;
		this.field = tableField;
		this.gameStatus = EGameStatus.NOT_STARTED;
	}

	static createStandardGame() :PongGame
	{
		const leftPaddle: Paddle = new Paddle(new Point(-4, 0));
		const rightPaddle: Paddle = new Paddle(new Point(4, 0));
		const ball: Ball = new Ball(new Point(0, 0));
		const table: PongField = new PongField();
		const score: ScoreBoard = new ScoreBoard();
		const game: PongGame = new PongGame(leftPaddle, rightPaddle, ball, score, table);
		return game;
	}


	getGameStatus(): EGameStatus
	{
		return this.gameStatus;
	}

	setGameStatus(newStatus:EGameStatus)
	{
		this.gameStatus = newStatus;
	}

	getPongWinnerSide(): "left" | "right"
	{
		return this.score.getWinnerSide();
	}

	async waitForFinalWhistle(): Promise<PongGame>
	{
		if(this.gameStatus === EGameStatus.FINISHED)
			return this;
		return new Promise((resolve, reject)=>
		{
			this.on(GameEvents.FINISHED, ()=>
			{
				resolve(this);
			})
		})
	}

	getPaddle(side: EPlayerSide): Paddle
	{
		if(side === EPlayerSide.LEFT)
			return this.leftPaddle;
		else if(side === EPlayerSide.RIGTH)
			return this.rightPaddle
		throw error("paddle not found")
	}

	pauseGame(): void
	{
		this.setGameStatus(EGameStatus.PAUSED);
		this.score.pause();
	}

	startGame(): void 
	{
		this.setGameStatus(EGameStatus.RUNNING);
		this.score.start();
		this.start();
	}

	finishGame():void 
	{
		this.setGameStatus(EGameStatus.FINISHED);
		this.emit(GameEvents.FINISHED, this);
	}

	getFrame()
	{
		return {
			leftPaddle: {
				x: this.leftPaddle.getPosition().getX(),
				y: this.leftPaddle.getPosition().getY(),
				height: this.leftPaddle.height
			}, 
			rightPaddle: 
			{
				x: this.rightPaddle.getPosition().getX(),
				y: this.rightPaddle.getPosition().getY(),
				height: this.rightPaddle.height
			},
			ball: 
			{
				x: this.ball.getPosition().getX(),
				y: this.ball.getPosition().getY(),
				radius: this.ball.getRadius()
			},
			score: this.score.getScoreJson(), 
			matchStatus: this.getGameStatus()
		};
	}

	movePaddle(paddle:Paddle, direction: "up" | "down")
	{
		if(this.isPaddleMoveAllowed(paddle,direction) && this.getGameStatus() === EGameStatus.RUNNING)
			paddle.move(direction);
	}

	forfeitGame(sideThatLeft: EPlayerSide.LEFT | EPlayerSide.RIGTH)
	{
		if(sideThatLeft === EPlayerSide.LEFT)
		{
			this.score.setScore(0, 3);
		}
		else if(sideThatLeft === EPlayerSide.RIGTH)
		{
			this.score.setScore(3, 0);
		}
		this.finishGame();
	}

	private isPaddleMoveAllowed(paddle:Paddle, direction: "up" | "down"):boolean
	{
		const maxY = this.field.TOP_EDGE_Y + (0.45) * paddle.height;
		const minY = this.field.BOTTOM_EDGE_Y - (0.45) * paddle.height;
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
		this.setGameStatus(EGameStatus.RUNNING);
		this.score.startCountdown();
		raf((timestamp:number)=> this.gameLoop(timestamp))
	}

	private gameLoop(timestamp: number):void 
	{
		if(this.getGameStatus() === EGameStatus.RUNNING)
		{
			//const deltaTime = timestamp - this.lastFrameTime;
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
		this.ball.resetDirection(goalSide);
		this.leftPaddle.resetPosition();
		this.rightPaddle.resetPosition();
	}
	
	private isLeftGoal(BallPoint:Point):boolean
	{
		if(BallPoint.getX() < this.field.LEFT_EDGE_X)
		{
			return true;
		}
		return false
	}
	
	private isRightGoal(BallPoint:Point):boolean
	{
		if(BallPoint.getX() > this.field.RIGHT_EDGE_X)
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
		if(ballPoint.getY() >= this.field.TOP_EDGE_Y)
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
		if(ballPoint.getY() <= this.field.BOTTOM_EDGE_Y)
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
		const topEdgePoint:Point = new Point(ballX, this.field.TOP_EDGE_Y);
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
		const bottomEdgePoint:Point = new Point(ballX, this.field.BOTTOM_EDGE_Y);
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
			edgeX = this.field.LEFT_EDGE_X;
			paddle = this.leftPaddle;
		}
		else
		{
			edgeX = this.field.RIGHT_EDGE_X;
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
