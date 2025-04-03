import { WebSocket } from "ws";
import { PongField } from "./PongField";
import { Point } from "./Point";
import { gameRequestSchema } from "./gameRequestSchema";
import {
	distanceBetweenPoints,
	findIntersectionWithVerticalLine,
	roundTo,
} from "./geometryUtils";

export class Bot {
	//game dimensions
	private readonly FRAME_RATE = 60;
	private readonly STEP = 0.05;
	private readonly BALL_SPEED = 0.1;
	private readonly PADDLE_GAP = 0.5;

	//room info
	private readonly difficulty: number;
	private readonly roomId: string;
	private readonly port: string;
	private readonly host: string;
	private readonly side: number;
	private ws: WebSocket | null;

	//dynamic game state
	private paddleTwist: number;
	private lastBall: Point;
	private target: Point;
	private framesUntilTarget: number;
	private framesAfterTarget: number;
	private moveCommand = { move: "", paddle: "" };
	private leftScore = 0;
	private rightScore = 0;
	private paddleY = 0;
	private movePaddleTo = 0;
	private paddleHeight = 0;
	private countdown = this.FRAME_RATE;

	constructor(initializers: any) {
		//room info
		this.difficulty = difficultySelector.get(initializers.difficulty) ?? 16;
		this.roomId = initializers.roomId;
		this.port = initializers.port ?? "3010";
		this.host = initializers.host ?? "127.0.0.1";
		this.side =
			initializers.side === "left"
				? field.LEFT_EDGE_X + this.PADDLE_GAP
				: field.RIGHT_EDGE_X - this.PADDLE_GAP;
		this.ws = null;

		//dynamic game state
		this.paddleTwist =
			paddleTwistSelector.get(initializers.difficulty) ?? 0;
		this.lastBall = new Point(0, 0);
		this.target = new Point(field.LEFT_EDGE_X + this.PADDLE_GAP, 0);
		this.framesUntilTarget = Math.round(
			Math.abs(this.target.getX()) / this.BALL_SPEED,
		);
		this.framesAfterTarget = this.FRAME_RATE - this.framesUntilTarget;
		this.moveCommand.paddle = this.side < 0 ? "left" : "right";
	}

	public playGame() {
		this.ws = new WebSocket(`wss://${this.host}:${this.port}/pong/`, {
			rejectUnauthorized: false,
		});

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
				this.handleEvent(event);
			});
		} catch (error) {
			console.error(`WebSocket at ${this.host}:${this.port}:`, error);
		}
	}

	public handleEvent(event: object) {
		if (--this.countdown) return;

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

		if (this.paddleY != this.movePaddleTo) this.makeMove(this.difficulty);
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
			await sleep(this.difficulty);
		} while ((twist -= this.STEP) > 0);
	}

	private resetLastBallAfterGoal(x: number) {
		let lastBallCorrection =
			this.framesUntilTarget * this.BALL_SPEED + this.PADDLE_GAP;
		if (x > 0) lastBallCorrection = -lastBallCorrection;
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
	}

	private calculateFrames(ballPosition: Point) {
		this.framesUntilTarget = Math.round(
			distanceBetweenPoints(ballPosition, this.target) / this.BALL_SPEED,
		);
		this.framesAfterTarget = this.FRAME_RATE - this.framesUntilTarget;
	}

	private updateLastBall(ballPosition: Point) {
		this.lastBall.setX(ballPosition.getX());
		this.lastBall.setY(ballPosition.getY());
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
			this.target.getX() === this.side ? this.target.getY() : 0;
		this.updateLastBall(ballPosition);
	}

	private ballBounced(distance: number): boolean {
		const expectedDistance = this.ballHitPaddle()
			? this.framesAfterTarget
			: this.FRAME_RATE;
		console.log(Math.round(distance / this.BALL_SPEED));
		return Math.round(distance / this.BALL_SPEED) < expectedDistance - 2; // magic number to account for one or two dropped frames
	}

	private logAIState() {
		let AIState = {
			lastBall: { x: this.lastBall.getX(), y: this.lastBall.getY() },
			target: { x: this.target.getX(), y: this.target.getY() },
			framesUntilTarget: this.framesUntilTarget,
			framesAfterTarget: this.framesAfterTarget,
			ballHitPaddle: this.ballHitPaddle(),
			paddleTwist: this.paddleHeight,
		};
		console.log(AIState);
	}
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const field = new PongField();

//difficulty number = delay between AI moves in ms
const difficultySelector = new Map<string, number>([
	["easy", 24],
	["medium", 16],
	["hard", 8],
	["insane", 0],
]);

//the AI will twist the ball. maximum twist = 0.5 a.k.a. half of paddle height
const paddleTwistSelector = new Map<string, number>([
	["easy", 0],
	["medium", 0.1],
	["hard", 0.25],
	["insane", 0.45],
]);
