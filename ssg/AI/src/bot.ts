import { WebSocket } from "ws";
import { PongField } from "./PongField";
import { Point } from "./Point";
import {
	distanceBetweenPoints,
	findIntersectionWithVerticalLine,
	roundTo,
	sleep,
	findGradient,
} from "./utils";

class Ball extends Point {
	constructor(x: number, y: number) {
		super(x, y);
	}

	public setY(y: number) {
		console.log("y was: ", super.getY(), " now: ", y);
		super.setY(y);
	}

	public setX(x: number) {
		super.setX(x);
	}

	public getX() {
		return super.getX();
	}

	public getY() {
		return super.getY();
	}
}

export class Bot {
	//game dimensions
	private readonly FRAME_RATE = 60;
	private readonly STEP = 0.05;
	private readonly BALL_SPEED = 0.1;
	private readonly PADDLE_GAP = 0.5;
	private readonly MANDATORY_SPEED = 1000 / this.FRAME_RATE;

	//room info
	private readonly difficulty: string;
	private readonly botSpeed: number;
	private readonly port = "3010";
	private readonly host = "pong-api";
	private side: number;
	private roomId: "";
	private ws: WebSocket | null;

	//dynamic game state
	private paddleTwist: number;
	private lastBall: Ball;
	private target: Point;
	private framesUntilTarget: number;
	private framesAfterTarget: number;
	private moveCommand = { move: "", paddle: "" };
	private leftScore = 0;
	private rightScore = 0;
	private paddleY = 0;
	private movePaddleTo = 0;
	private opponentAim = { updates: 0, gradient: 0 };
	private countdown = this.FRAME_RATE + 2; // to skip the first welcome frame
	private firstFrame = true;

	constructor(initializers: any) {
		//room info
		this.difficulty = initializers.difficulty ?? "normal";
		this.botSpeed =
			initializers.mode === "mandatory"
				? this.MANDATORY_SPEED
				: (botSpeedSelector.get(this.difficulty) ??
					this.MANDATORY_SPEED);
		this.roomId = initializers.roomId ?? "unknown_room_id";
		const initSide = initializers.side ?? "right";
		this.side =
			initSide === "right"
				? field.RIGHT_EDGE_X - this.PADDLE_GAP
				: field.LEFT_EDGE_X + this.PADDLE_GAP;
		this.ws = null;

		//dynamic game state
		this.paddleTwist = paddleTwistSelector.get(this.difficulty) ?? 0;
		this.lastBall = new Point(0, 0);
		this.target = new Point(field.LEFT_EDGE_X + this.PADDLE_GAP, 0);
		this.framesUntilTarget = Math.round(
			Math.abs(this.target.getX()) / this.BALL_SPEED,
		);
		this.framesAfterTarget = this.FRAME_RATE - this.framesUntilTarget;
		this.moveCommand.paddle = this.side < 0 ? "left" : "right";
	}

	public playGame() {
		this.ws = new WebSocket(`ws://${this.host}:${this.port}/pong-api/pong`);

		try {
			this.ws.on("open", () => {
				console.log(
					`Connected to Pong WebSocket at ${this.host}:${this.port} for room ${this.roomId}`,
				);
			});

			this.ws.on("error", (event: any) => {
				console.error(JSON.stringify(event));
				return;
			});

			this.ws.on("close", (event: any) => {
				console.log(
					`WebSocket closed at ${this.host}:${this.port} in room ${this.roomId}: `,
					event,
				);
				return;
			});

			this.ws.on("message", (event: any) => {
				if (--this.countdown == 0) this.handleEvent(event);
				else if (this.firstFrame) {
					this.readFirstFrame(event);
					this.firstFrame = false;
				}
			});
		} catch (error) {
			console.error(`WebSocket at ${this.host}:${this.port}: `, error);
		}
	}

	public handleEvent(event: object) {
		const gameState = JSON.parse(event.toString());
		console.log(gameState);

		const ballPosition = new Point(
			roundTo(gameState.ball.x, 2),
			roundTo(gameState.ball.y, 2),
		);
		this.paddleY =
			this.side < 0
				? roundTo(gameState.leftPaddle.y, 2)
				: roundTo(gameState.rightPaddle.y, 2);
		if (this.paddleTwist >= gameState.leftPaddle.height / 2)
			this.paddleTwist *= gameState.leftPaddle.height;
		this.countdown = this.FRAME_RATE;

		this.handleScore(gameState.score);
		this.calculateTarget(ballPosition);
		this.logAIState();

		if (this.paddleY != this.movePaddleTo) this.makeMove(this.botSpeed);
		else this.twistBall(this.paddleTwist);
	}

	private async makeMove(delay: number) {
		if (!this.ws) return;
		this.moveCommand.move =
			this.paddleY < this.movePaddleTo ? "up" : "down";

		while (
			this.paddleY >
			this.movePaddleTo + this.STEP + this.paddleTwist
		) {
			this.paddleY -= this.STEP;
			this.ws.send(JSON.stringify(this.moveCommand));
			await sleep(delay);
		}
		while (
			this.paddleY <
			this.movePaddleTo - this.STEP - this.paddleTwist
		) {
			this.paddleY += this.STEP;
			this.ws.send(JSON.stringify(this.moveCommand));
			await sleep(delay);
		}
	}

	//the point of this function is for the AI to leave the middle
	private async twistBall(twist: number) {
		if (!this.ws) return;
		this.moveCommand.move = "down";

		do {
			this.ws.send(JSON.stringify(this.moveCommand));
			await sleep(this.botSpeed);
		} while ((twist -= this.STEP) > 0);
	}

	private resetLastBallAfterGoal(x: number) {
		const losingEdgeX =
			this.target.getX() < 0 ? field.LEFT_EDGE_X : field.RIGHT_EDGE_X;
		const losingEdgeY = findIntersectionWithVerticalLine(
			this.lastBall,
			this.target,
			losingEdgeX,
		);
		const ballLostAt = new Point(losingEdgeX, losingEdgeY);
		let lastBallCorrection = distanceBetweenPoints(ballLostAt, this.lastBall);
		if (x > 0) lastBallCorrection *= -1;
		this.lastBall.setX(lastBallCorrection);
		this.lastBall.setY(0);
	}

	private resetAfterGoal(x: number) {
		this.target.setX(x);
		this.target.setY(0);
		this.resetLastBallAfterGoal(x);
		this.calculateFrames(this.lastBall);
	}

	private handleScore(score: any) {
		while (score.leftGoals !== this.leftScore) {
			this.leftScore++;
			this.resetAfterGoal(field.RIGHT_EDGE_X - this.PADDLE_GAP); //if left side scored, ball will go to the right
		}
		while (score.rightGoals !== this.rightScore) {
			this.rightScore++;
			this.resetAfterGoal(field.LEFT_EDGE_X + this.PADDLE_GAP);
		}
	}

	private accountForBounce(y: number): number {
		const adjustY = (field.TOP_EDGE_Y - Math.abs(y)) * 2;
		y += y > 0 ? adjustY : -adjustY;
		return y;
	}

	private ballHitPaddle(): boolean {
		return this.framesUntilTarget < this.FRAME_RATE;
	}

	private ballVectorOrigin(): Point {
		if (this.ballHitPaddle())
			return new Point(this.target.getX(), this.target.getY());
		return new Point(this.lastBall.getX(), this.lastBall.getY());
	}

	private provisionalTarget(ballPosition: Point) {
		const origin = this.ballVectorOrigin();
		const distance = distanceBetweenPoints(origin, ballPosition);
		if (this.ballBounced(distance))
			ballPosition.setY(this.accountForBounce(ballPosition.getY()));
		if (this.ballHitPaddle()) this.target.setX(-this.target.getX());
		this.target.setY(
			findIntersectionWithVerticalLine(
				origin,
				ballPosition,
				this.target.getX(),
			),
		);
		if (this.target.getX() === this.side)
			this.updateOpponentAim(findGradient(ballPosition, this.target));
	}

	private calculateFrames(ballPosition: Point) {
		this.framesUntilTarget = Math.round(
			distanceBetweenPoints(ballPosition, this.target) / this.BALL_SPEED,
		);
		this.framesAfterTarget = this.FRAME_RATE - this.framesUntilTarget;
	}

	private updateLastBall(ballPosition: Point) {
		console.log("last ball: ", this.lastBall);
		this.lastBall.setX(ballPosition.getX());
		this.lastBall.setY(ballPosition.getY());
	}

	private readFirstFrame(event: object) {
		const roomInfo = JSON.parse(event.toString());
		if (Object.getOwnPropertyNames(roomInfo).includes("roomId")) {
			this.roomId = roomInfo.roomId;
		}
		if (Object.getOwnPropertyNames(roomInfo).includes("matchStatus")) {
			let status = roomInfo.matchStatus;
			if (status.includes("Left one") || status.includes("left one"))
				this.side = field.LEFT_EDGE_X + this.PADDLE_GAP;
		}
	}

	private updateOpponentAim(gradient: number) {
		this.opponentAim.gradient =
			this.opponentAim.gradient * this.opponentAim.updates++ + gradient;
		this.opponentAim.gradient /= this.opponentAim.updates;
	}

	private probableAim(opponentHit: Point): number {
		if (this.opponentAim.updates < 3) return 0;
		const direction = this.side > 0 ? 1 : -1;
		// expected position after opponent hits the ball and ball moves 1 along x axis
		const expectedPosition = new Point(
			direction,
			opponentHit.getY() + this.opponentAim.gradient,
		);
		let aimY = findIntersectionWithVerticalLine(
			opponentHit,
			expectedPosition,
			this.side,
		);
		while (aimY > field.TOP_EDGE_Y || aimY < field.BOTTOM_EDGE_Y)
			aimY = this.accountForBounce(aimY);
		return roundTo(aimY, 2);
	}

	private calculateTarget(ballPosition: Point) {
		this.provisionalTarget(ballPosition);
		this.calculateFrames(ballPosition);
		while (
			this.target.getY() > field.TOP_EDGE_Y ||
			this.target.getY() < field.BOTTOM_EDGE_Y
		)
			this.target.setY(this.accountForBounce(this.target.getY()));
		this.movePaddleTo =
			this.target.getX() === this.side
				? this.target.getY()
				: 0;
		this.updateLastBall(ballPosition);
	}

	private ballBounced(distance: number): boolean {
		const expectedDistance = this.ballHitPaddle()
			? this.framesAfterTarget
			: this.FRAME_RATE;
		return Math.round(distance / this.BALL_SPEED) < expectedDistance - 2; // magic number to account for 2 dropped frame
	}

	private logAIState() {
		let AIState = {
			lastBall: { x: this.lastBall.getX(), y: this.lastBall.getY() },
			target: { x: this.target.getX(), y: this.target.getY() },
			averageOpponentAim: this.opponentAim.gradient,
			framesUntilTarget: this.framesUntilTarget,
			framesAfterTarget: this.framesAfterTarget,
			ballHitPaddle: this.ballHitPaddle(),
			movePaddleTo: this.movePaddleTo,
		};
		console.log(AIState);
	}
}

const field = new PongField();

//difficulty number = delay between AI moves in ms
const botSpeedSelector = new Map<string, number>([
	["normal", 1000 / 60],
	["hard", 8],
	["insane", 0],
]);

//the AI will twist the ball. maximum twist = 0.5 a.k.a. half of paddle height
const paddleTwistSelector = new Map<string, number>([
	["normal", 0],
	["hard", 0.25],
	["insane", 0.45],
]);
