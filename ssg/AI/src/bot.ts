import { WebSocket } from "ws";
import { PongField } from "../imports/PongField";
import { Point } from "../imports/Point";
import {
	distanceBetweenPoints,
	findIntersectionWithVerticalLine,
	roundTo,
	sleep,
	findGradient,
} from "./utils";

const field = new PongField();

export class Bot {
	//game dimensions
	private readonly FRAME_RATE = 60;
	private readonly STEP = 0.05;
	private readonly BALL_SPEED = 0.1;
	private readonly PADDLE_GAP = 0.5;
	private readonly MANDATORY_SPEED = 1000 / this.FRAME_RATE;
	private readonly BALL_RADIUS = 0.075;

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
	private lastBall: Point;
	private target: Point;
	private framesUntilTarget: number;
	private framesAfterTarget: number;
	private moveCommand = { move: "" };
	private leftScore = 0;
	private rightScore = 0;
	private paddleY = 0;
	private movePaddleTo = 0;
	private opponentAim = { updates: 0, gradient: 0, direction: 0 };
	private paddleHeight = 1;
	private countdown = this.FRAME_RATE + 2; // to skip the first welcome frame
	private firstFrame = true;
	private timer = 5000;

	constructor(initializers: any) {
		console.log(initializers);
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
	}

	//timeout increments if we receive a message from websocket
	private async checkTimeout() {
		if (!this.ws) return;
		while (this.timer > 0) {
			await sleep(this.timer);
			this.timer -= 1000;
		}
		console.log("Game hasn't started, disconnecting...");
		this.ws.terminate();
	}

	public playGame() {
		this.ws = new WebSocket(
			`ws://${this.host}:${this.port}/${this.host}/pong/singles?roomId=${this.roomId}`,
		);
		try {
			this.ws.on("open", () => {
				console.log(
					`Connected to Pong WebSocket at ${this.host}:${this.port} for room ${this.roomId}`,
					"time left until disconnect = ",
					this.timer / 1000,
				);
				this.checkTimeout();
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
			throw error;
		}
	}

	// check game state, calculate target based on the last known positions, and send moves
	public handleEvent(event: object) {
		this.timer += 1000;
		this.countdown = this.FRAME_RATE;

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

		this.paddleHeight =
			this.side < 0
				? gameState.leftPaddle.height
				: gameState.rightPaddle.height;

		if (this.paddleTwist >= this.paddleHeight / 2)
			this.paddleTwist *= this.paddleHeight;

		this.handleScore(gameState.score);
		this.calculateTarget(ballPosition);
		this.logAIState();

		if (this.paddleY != this.movePaddleTo) this.makeMove(this.botSpeed);
		else this.twistBall(this.paddleTwist);
	}

	// send the necessary amount of moves to ws to get to the calculated target
	// taking into account the paddle twist and the user movement speed
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

	// if someone scored, the ball starts in the middle -> update the last ball position
	private resetLastBallAfterGoal(x: number) {
		let lastBallCorrection =
			this.framesUntilTarget * this.BALL_SPEED + this.PADDLE_GAP * 2;
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

	// calculate the intersection of the ball vector and either paddle line
	// based on the current ball position, the last known target and the last known ball position
	// disregard the table top and bottom for now
	private provisionalTarget(ballPosition: Point) {
		const origin = this.ballVectorOrigin();
		const distance = distanceBetweenPoints(origin, ballPosition);
		if (this.ballBounced(distance)) {
			ballPosition.setY(this.accountForBounce(ballPosition.getY()));
		}
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
			this.opponentAim.gradient * this.opponentAim.updates++ +
			Math.abs(gradient);
		this.opponentAim.gradient /= this.opponentAim.updates;
		this.opponentAim.direction += gradient > 0 ? 1 : -1;
	}

	private probableAim(opponentHit: Point): number {
		if (this.opponentAim.updates < 3) return 0;
		const direction = this.side > 0 ? 1 : -1;
		// expected position after opponent hits the ball and ball moves 1 along x axis
		// based on average gradient and direction
		const expectedPosition = new Point(
			direction,
			(opponentHit.getY() + this.opponentAim.gradient) *
				(this.opponentAim.direction > 0 ? 1 : -1),
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
		this.updateLastBall(ballPosition);
		this.movePaddleTo =
			this.target.getX() === this.side ? this.target.getY() : 0;
		if (this.canReachTarget() === false) this.movePaddleTo = 0;
	}

	private canReachTarget(): boolean {
		if (this.target.getX() !== this.side) return true;

		let reachable = true;
		if (Math.abs(this.side) < Math.abs(this.lastBall.getX())) {
			reachable = false;
		} else if (
			this.framesUntilTarget <
			(this.movePaddleTo -
				this.paddleY -
				this.paddleHeight / 2 -
				this.BALL_RADIUS) /
				this.STEP // the number of frames to reach our target
		) {
			reachable = false;
		}
		return reachable;
	}

	private ballBounced(distance: number): boolean {
		const expectedDistance = this.ballHitPaddle()
			? this.framesAfterTarget
			: this.FRAME_RATE;
		this.logBounce(distance, expectedDistance);
		return Math.round(distance / this.BALL_SPEED) < expectedDistance - 2; // to account for 2 dropped frame or bad rounding
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

	private logBounce(distance: number, expectedDistance: number) {
		console.log(
			"expected distance: ",
			expectedDistance,
			" distance: ",
			Math.round(distance / this.BALL_SPEED),
		);
	}
}

//difficulty number = delay between AI moves in ms
const botSpeedSelector = new Map<string, number>([
	["easy", 1000 / 60],
	["normal", 8],
	["hard", 0],
]);

//the AI will twist the ball. maximum twist = 0.5 a.k.a. half of paddle height
const paddleTwistSelector = new Map<string, number>([
	["easy", 0],
	["normal", 0.25],
	["hard", 0.4],
]);
