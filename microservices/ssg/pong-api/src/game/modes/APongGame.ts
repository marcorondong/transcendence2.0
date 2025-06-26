import { EventEmitter } from "stream";
import { Ball, IBallJson } from "../elements/Ball";
import { ScoreBoard, IScore } from "../elements/ScoreBoard";
import { PongField } from "../elements/PongField";
import { EPlayerRole, ETeamSideFiltered, ETeamSide } from "../PongPlayer";
import { GameEvents } from "../../customEvents";
import { Paddle } from "../elements/Paddle";
import raf from "raf"; //raf is request animation frame
import { Point, VectorDirection } from "../elements/Point";

export enum EGameStatus {
	NOT_STARTED,
	RUNNING,
	PAUSED,
	FINISHED,
}

export interface IPongFrameBase {
	ball: IBallJson;
	score: IScore;
	matchStatus: string;
}

export abstract class APongGame extends EventEmitter {
	protected ball: Ball;
	protected readonly score: ScoreBoard;
	protected readonly field: PongField;
	readonly CRITICAL_DISTANCE;
	protected readonly gameId: string;
	protected gameStatus: EGameStatus;
	protected saveToDatabase: boolean;

	abstract getPaddle(role: EPlayerRole): Paddle;
	abstract resetPaddlePosition(): void;
	abstract getCloserLeftPaddle(): Paddle;
	abstract getCloserRightPaddle(): Paddle;
	abstract storeResultInDatabase(
		winnerId: string,
		loserId: string,
	): Promise<void>;

	constructor(ball: Ball, score: ScoreBoard, field: PongField) {
		super();
		this.gameId = crypto.randomUUID();
		this.ball = ball;
		this.score = score;
		this.field = field;
		this.CRITICAL_DISTANCE = ball.getCriticalDistance();
		this.gameStatus = EGameStatus.NOT_STARTED;
		this.saveToDatabase = true;
	}

	getGameId(): string {
		return this.gameId;
	}

	disableSaveToDatabase(): void {
		this.saveToDatabase = false;
	}

	isSaveToDatabaseEnabled(): boolean {
		return this.saveToDatabase;
	}

	getGameStatus(): EGameStatus {
		return this.gameStatus;
	}

	getGameStatusString(): string {
		switch (this.gameStatus) {
			case EGameStatus.FINISHED:
				return "Game finished";
			case EGameStatus.NOT_STARTED:
				return "Game didn`t start yet. Lobby phase";
			case EGameStatus.PAUSED:
				return "Game is paused";
			case EGameStatus.RUNNING:
				return "Game is running";
		}
	}

	setGameStatus(newStatus: EGameStatus): void {
		this.gameStatus = newStatus;
	}

	getScoreBoard(): ScoreBoard {
		return this.score;
	}

	getPongWinnerSide(): ETeamSideFiltered {
		return this.score.getWinnerSide();
	}

	getPongLoserSide(): ETeamSideFiltered {
		return this.score.getLoserSide();
	}

	async waitForFinalWhistle(): Promise<APongGame> {
		if (this.gameStatus === EGameStatus.FINISHED) return this;
		return new Promise((resolve, reject) => {
			this.once(GameEvents.FINISHED, () => {
				resolve(this);
			});
		});
	}

	pauseGame(): void {
		this.setGameStatus(EGameStatus.PAUSED);
		this.score.pause();
	}

	startGame(): void {
		this.setGameStatus(EGameStatus.RUNNING);
		this.score.start();
		this.start();
	}

	finishGame() {
		this.setGameStatus(EGameStatus.FINISHED);
		this.emit(GameEvents.FINISHED, this);
	}

	movePaddle(paddle: Paddle, direction: "up" | "down"): void {
		if (
			this.isPaddleMoveAllowed(paddle, direction) &&
			this.getGameStatus() === EGameStatus.RUNNING
		)
			paddle.move(direction);
	}

	forfeitGame(sideThatLeft: ETeamSide.LEFT | ETeamSide.RIGHT): void {
		if (sideThatLeft === ETeamSide.LEFT) {
			this.score.setScore(0, 3);
		} else if (sideThatLeft === ETeamSide.RIGHT) {
			this.score.setScore(3, 0);
		}
		this.finishGame();
	}

	getBaseFrame(): IPongFrameBase {
		return {
			score: this.score.getScoreJson(),
			matchStatus: this.getGameStatusString(),
			ball: this.ball.getBallJson(),
		};
	}

	private isPaddleMoveAllowed(
		paddle: Paddle,
		direction: "up" | "down",
	): boolean {
		const maxY = this.field.TOP_EDGE_Y + 0.45 * paddle.getHeight();
		const minY = this.field.BOTTOM_EDGE_Y - 0.45 * paddle.getHeight();
		let move_modifier = paddle.getMoveModifier();
		if (direction === "down") move_modifier *= -1;
		const newPaddleY = paddle.getPosition().getY() + move_modifier;
		if (newPaddleY >= maxY) return false;
		if (newPaddleY <= minY) return false;
		return true;
	}

	private start(): void {
		this.setGameStatus(EGameStatus.RUNNING);
		this.score.startCountdown();
		raf((timestamp: number) => this.gameLoop(timestamp));
	}

	protected renderNextFrame(): void {
		this.ballMovementMechanics();
		this.ball.moveBall();
		if (this.score.isWinnerDecided() === true) this.finishGame();
	}

	private gameLoop(timestamp: number): void {
		if (this.getGameStatus() === EGameStatus.RUNNING) {
			this.renderNextFrame();
		}
		raf((timestamp: number) => this.gameLoop(timestamp));
	}

	private isObstacleNear(
		obstaclePoint: Point,
		criticalDistance: number = this.CRITICAL_DISTANCE,
	): boolean {
		const currentDistance = Point.calculateDistance(
			obstaclePoint,
			this.ball.getPosition(),
		);
		if (currentDistance <= criticalDistance) return true;
		return false;
	}

	private scoredGoal(goalSide: "left" | "right"): void {
		let strikerSide: "left" | "right";
		if (goalSide === "left") strikerSide = "right";
		else strikerSide = "left";
		this.score.score(strikerSide);
		this.ball.resetPosition();
		this.ball.resetDirection(goalSide);
		this.resetPaddlePosition();
	}

	private isLeftGoal(BallPoint: Point): boolean {
		if (BallPoint.getX() < this.field.LEFT_EDGE_X) {
			return true;
		}
		return false;
	}

	private isRightGoal(BallPoint: Point): boolean {
		if (BallPoint.getX() > this.field.RIGHT_EDGE_X) {
			return true;
		}
		return false;
	}

	private isGoal(): boolean {
		if (this.ball.isMovingRight()) {
			return this.isRightGoal(this.ball.getPosition());
		} else if (this.ball.isMovingLeft()) {
			return this.isLeftGoal(this.ball.getPosition());
		}
		return false;
	}

	/**
	 *
	 * @param ballPoint (usually up point of ball)
	 * @returns true if ball point touches the top of field
	 */
	private isTopHit(ballPoint: Point): boolean {
		if (ballPoint.getY() >= this.field.TOP_EDGE_Y) {
			return true;
		}
		return false;
	}

	/**
	 *
	 * @param ballPoint (usually down point of ball)
	 * @returns true if ball point touches the top of field
	 */
	private isBottomHit(ballPoint: Point): boolean {
		if (ballPoint.getY() <= this.field.BOTTOM_EDGE_Y) {
			return true;
		}
		return false;
	}

	private isBounceEdge(side: "top" | "bottom"): boolean {
		const ballHitPoints: Map<VectorDirection, Point> =
			this.ball.getBallHitBoxPoints();
		let result = false;
		if (side === "top") {
			const topPoint = ballHitPoints.get(VectorDirection.UP);
			if (topPoint !== undefined) result = this.isTopHit(topPoint);
			else result = false;
		} else {
			const bottomPoint = ballHitPoints.get(VectorDirection.DOWN);
			if (bottomPoint !== undefined)
				result = this.isBottomHit(bottomPoint);
			else result = false;
		}
		return result;
	}

	protected topEdgeCollision(): boolean {
		const ballX = this.ball.getPosition().getX();
		const topEdgePoint: Point = new Point(ballX, this.field.TOP_EDGE_Y);
		if (this.ball.isMovingUp() && this.isObstacleNear(topEdgePoint)) {
			if (this.isBounceEdge("top")) {
				return true;
			}
		}
		return false;
	}

	protected bottomEdgeCollision(): boolean {
		const ballX = this.ball.getPosition().getX();
		const bottomEdgePoint: Point = new Point(
			ballX,
			this.field.BOTTOM_EDGE_Y,
		);
		if (this.ball.isMovingDown() && this.isObstacleNear(bottomEdgePoint)) {
			if (this.isBounceEdge("bottom")) {
				return true;
			}
		}
		return false;
	}

	protected sideMechanics(
		side: "left" | "right",
		closestPaddle: Paddle,
	): void {
		const ballY = this.ball.getPosition().getY();
		let edgeX;
		if (side === "left") edgeX = this.field.LEFT_EDGE_X;
		else edgeX = this.field.RIGHT_EDGE_X;
		const EdgePoint: Point = new Point(edgeX, ballY);
		const heightBeforeHit = closestPaddle.getHeight();
		const impactPointPaddle: Point | false = this.paddleBounce(
			closestPaddle,
			this.ball.getDirection().getX(),
		);
		if (impactPointPaddle !== false) {
			const bounceDir: Point = this.ball.calculateComplexBounceDirection(
				closestPaddle.getPosition(),
				heightBeforeHit,
			);
			return this.ball.setDirection(bounceDir);
		}
		if (this.isObstacleNear(EdgePoint) && this.isGoal())
			return this.scoredGoal(side);
	}

	protected ballMovementMechanics(): void {
		if (this.topEdgeCollision() || this.bottomEdgeCollision())
			return this.ball.simpleBounceY();
		if (this.ball.isMovingLeft()) {
			return this.sideMechanics("left", this.getCloserLeftPaddle());
		}
		if (this.ball.isMovingRight()) {
			return this.sideMechanics("right", this.getCloserRightPaddle());
		}
	}

	//it is maybe possible to gain some performance if return  false check is made if paddle is too far from ball
	/**
	 *
	 * @param paddle
	 * @returns either false or Point it hits
	 */
	private paddleBounce(
		paddle: Paddle,
		ballDirectionX: number,
	): false | Point {
		const paddleHitPoints = paddle.getPaddleHitBoxPoints(ballDirectionX);
		for (const point of paddleHitPoints) {
			if (this.ball.isHit(point) == true) {
				if (this.score.isOvertime() === true) paddle.shrinkPaddle();
				return point;
			}
		}
		return false;
	}
}
