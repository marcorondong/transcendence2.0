import { WebSocket } from "ws";
import { PongField } from "../imports/PongField";
import { Point } from "../imports/Point";
import {
	distanceBetweenPoints,
	findIntersectionWithVerticalLine,
	roundTo,
	sleep,
} from "./utils";
import { paddleTwistSelector, GameState, Score } from "./config";

const field = new PongField();

export class Bot {
	//game dimensions
	private readonly FRAME_RATE = 60;
	private readonly STEP = 0.05;
	private readonly BALL_SPEED = 0.1;
	private readonly PADDLE_GAP = 0.5;
	private readonly MANDATORY_SPEED = 1000 / this.FRAME_RATE;
	private readonly BALL_RADIUS = 0.075;
	private readonly AVG_BOUNCE_GAP = 0.03; // the average distance between the ball and the paddle when it bounces

	//room info
	private readonly difficulty: string;
	private readonly botSpeed: number;
	private readonly port = "3010";
	private readonly host = "pong-api";
	private side: number;
	private roomId: string = "";
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
	private paddleHeight = 1;
	private welcomeFrames = 2;
	private disconnectTimeout = 10000;
	private handlingBlocked = false;

	constructor(initializers: any) {
		console.log(initializers);
		//room info
		this.difficulty = initializers.difficulty ?? "normal";
		this.botSpeed =
			initializers.mode === "mandatory" ? this.MANDATORY_SPEED : 0;
		this.roomId = initializers.roomId ?? "unknown_room_id";
		this.side = field.RIGHT_EDGE_X - this.PADDLE_GAP - this.AVG_BOUNCE_GAP;
		this.ws = null;

		//dynamic game state
		this.paddleTwist = paddleTwistSelector[this.difficulty] ?? 0;
		this.lastBall = new Point(0, 0);
		this.target = new Point(this.side, 0);
		this.framesUntilTarget = Math.round(
			Math.abs(this.target.getX()) / this.BALL_SPEED,
		);
		this.framesAfterTarget = this.FRAME_RATE - this.framesUntilTarget;
	}

	public playGame(cookie: string) {
		this.ws = new WebSocket(
			`ws://${this.host}:${this.port}/${this.host}/pong/singles?roomId=${this.roomId}`,
			{ headers: { Cookie: cookie } },
		);
		try {
			this.ws.on("open", () => {
				console.log(
					`Connected to Pong WebSocket at ${this.host}:${this.port} for room ${this.roomId}`,
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
				if (this.welcomeFrames) {
					this.readWelcomeFrames(event);
					this.welcomeFrames--;
				} else if (this.handlingBlocked === false) {
					this.handlingBlocked = true;
					this.handleEvent(event);
					setTimeout(() => {
						this.handlingBlocked = false;
					}, 1000);
				}
			});
		} catch (error) {
			console.error(`WebSocket at ${this.host}:${this.port}: `, error);
			throw error;
		}
	}

	/*************************************************************************** */
	/*                          TIME + MESSAGE HANDLING                          */
	/*************************************************************************** */

	private resetTimeout() {
		this.disconnectTimeout = 10000; // reset the timeout to 10 seconds
	}

	//if no activity, close the connection
	private async checkTimeout() {
		if (!this.ws) return;
		while (this.disconnectTimeout > 0) {
			this.disconnectTimeout = 0;
			await sleep(10000);
		}
		console.log("Game is inactive, terminating ", this.roomId);
		this.ws.terminate();
	}

	private readWelcomeFrames(event: object) {
		const roomInfo = JSON.parse(event.toString());
		console.log("first frame: ", roomInfo);
		if (Object.getOwnPropertyNames(roomInfo).includes("roomId")) {
			this.roomId = roomInfo.roomId;
		}
		if (Object.getOwnPropertyNames(roomInfo).includes("matchStatus")) {
			let status = roomInfo.matchStatus;
			if (status.includes("Left") || status.includes("left"))
				this.side =
					field.LEFT_EDGE_X + this.PADDLE_GAP + this.AVG_BOUNCE_GAP;
		}
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

	/*************************************************************************** */
	/*                              ALGORITHM                                    */
	/*************************************************************************** */

	// check game state, calculate target based on the last known positions, and send moves
	public async handleEvent(event: object) {
		this.resetTimeout();

		const gameState = JSON.parse(event.toString()) as GameState;

		const ballPosition = new Point(gameState.ball.x, gameState.ball.y);
		this.logGameState(gameState);
		this.updatePaddle(gameState);
		this.handleScore(gameState.score);
		this.calculateTarget(ballPosition);
		this.logAIState();

		if (this.paddleY != this.movePaddleTo) this.makeMove(this.botSpeed);
		else this.twistBall(this.paddleHeight / 2 - this.BALL_RADIUS);
	}

	private calculateTarget(ballPosition: Point) {
		this.provisionalTarget(ballPosition);
		this.calculateFrames(ballPosition);
		this.updateLastBall(ballPosition);
		this.finalTarget();
		this.whereToMovePaddle();
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

	private updatePaddle(gameState: GameState) {
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

	private handleScore(score: Score) {
		while (score.leftTeam.goals !== this.leftScore) {
			this.leftScore++;
			this.resetAfterGoal(
				field.RIGHT_EDGE_X - this.PADDLE_GAP - this.AVG_BOUNCE_GAP,
			); //if left side scored, ball will go to the right
		}
		while (score.rightTeam.goals !== this.rightScore) {
			this.rightScore++;
			this.resetAfterGoal(
				field.LEFT_EDGE_X + this.PADDLE_GAP + this.AVG_BOUNCE_GAP,
			); //if right side scored, ball will go to the left
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
	}

	private calculateFrames(ballPosition: Point) {
		this.framesUntilTarget = Math.floor(
			distanceBetweenPoints(ballPosition, this.target) / this.BALL_SPEED,
		);
		this.framesAfterTarget = this.FRAME_RATE - this.framesUntilTarget;
	}

	private updateLastBall(ballPosition: Point) {
		this.lastBall.setX(ballPosition.getX());
		this.lastBall.setY(ballPosition.getY());
	}

	private finalTarget() {
		while (
			this.target.getY() > field.TOP_EDGE_Y ||
			this.target.getY() < field.BOTTOM_EDGE_Y
		)
			this.target.setY(this.accountForBounce(this.target.getY()));
	}

	private whereToMovePaddle() {
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
			this.botSpeed !== 0 &&
			this.framesUntilTarget <
				(this.movePaddleTo -
					this.paddleY -
					this.paddleHeight / 2 -
					this.BALL_RADIUS / 2) /
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
		return Math.round(distance / this.BALL_SPEED) < expectedDistance - 2; // to account for bounce calculation on server side
	}

	/*************************************************************************** */
	/*                              LOGGING                                      */
	/*************************************************************************** */

	private logAIState() {
		let AIState = {
			target: {
				x: roundTo(this.target.getX(), 2),
				y: roundTo(this.target.getY(), 2),
			},
			framesUntilTarget: this.framesUntilTarget,
			framesAfterTarget: this.framesAfterTarget,
			ballHitPaddle: this.ballHitPaddle(),
			movePaddleTo: roundTo(this.movePaddleTo, 2),
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

	private logGameState(gameState: GameState) {
		console.log(gameState.score);
		console.log(gameState.ball);
	}
}
