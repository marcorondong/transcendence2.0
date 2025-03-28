import { WebSocket, RawData } from 'ws';
import { PongField } from '../ssg/pong-api/src/game/PongField';
import { Point } from '../ssg/pong-api/src/game/Point';
import { getTrailingCommentRanges } from 'typescript';
import { distanceBetweenPoints, findIntersectionWithVerticalLine, roundTo } from './geometryUtils';
import { count } from 'console';

export class Bot
{
	private readonly REFRESH_RATE = 60;
	private readonly STEP = 0.05;
	private readonly BALL_SPEED = 0.1;
	private readonly PADDLE_GAP = 0.5;

	private readonly roomId_: string;
	private readonly port_: string;
	private readonly host_: string;
	private readonly side_: number;
	private readonly difficulty_: number;
	private readonly ws_: WebSocket;

	private countdown_: number;
	private lastBall_: Point;
	private paddleY_: number;
	private target_: Point;
	private ticksAfterTarget_: number;
	private ticksUntilTarget_: number;

	constructor(data: string) {
		const initializers = JSON.parse(data);
		this.difficulty_ = difficultySelector.get(initializers.difficulty) ?? 2;
		this.roomId_ = initializers.roomId;
		this.host_ = (initializers.host) ?? "127.0.0.1";
		this.port_ = (initializers.port) ?? "3010";
		this.side_ = (initializers.side === "left") ? field.LEFT_EDGE_X + this.PADDLE_GAP : field.RIGHT_EDGE_X - this.PADDLE_GAP;
		this.countdown_ = this.REFRESH_RATE + 1;
		this.lastBall_ = new Point(0, 0);
		this.paddleY_ = 0;
		this.target_ = new Point(field.LEFT_EDGE_X + this.PADDLE_GAP, 0);
		this.ticksUntilTarget_ = Math.round(Math.abs(this.target_.getX()) / this.BALL_SPEED);
		this.ticksAfterTarget_ = this.REFRESH_RATE - this.ticksUntilTarget_;
		this.ws_ = new WebSocket(`wss://${this.host_}:${this.port_}/pong/`, {rejectUnauthorized: false });
		
		try {

			this.ws_.on('open', () => {
				console.log(`Connected to Pong WebSocket at ${this.host_}:${this.port_} for room ${this.roomId_}`);
			});
	
			this.ws_.on('error', (event: any) => {
				throw new Error(JSON.stringify(event));
			});
	
			this.ws_.on('close', (event: any) => {
				console.log(`WebSocket closed at ${this.host_}:${this.port_} in room ${this.roomId_}: `, event);
			});
	
			this.ws_.on('message', (event: any) => {
				this.handleEvent(event);
			});
	
		} catch (error) {
			console.error(`WebSocket at ${this.host_}:${this.port_}:`, error);
		}
	}

	private logAIState() {
		let AIState = {
			lastBall: {x: this.lastBall_.getX(), y: this.lastBall_.getY()},
			target: {x: this.target_.getX(), y: this.target_.getY()},
			ticksUntilTarget: this.ticksUntilTarget_,
			ticksAfterTarget: this.ticksAfterTarget_,
			ballHitPaddle: this.ballHitPaddle(),
		}
		console.log(AIState);
	}

	public handleEvent(event: any) {
		if (--this.countdown_)
			return ;
		const gameState = JSON.parse(event.toString());
		console.log(gameState);
		this.logAIState();
		const ballPosition = new Point(roundTo(gameState.ball.x, 2), roundTo(gameState.ball.y, 2));
		const paddlePosition = (this.side_ < 0)
		? new Point(roundTo(gameState.leftPaddle.x, 2), roundTo(gameState.leftPaddle.y, 2))
		: new Point(roundTo(gameState.rightPaddle.x, 2), roundTo(gameState.rightPaddle.y, 2));
		this.paddleY_ = paddlePosition.getY();

		this.calculateTarget(ballPosition);
		this.logAIState();
		console.log("%s","\n");
		
		// console.log(`target y : ${this.target_.getY()}, paddleY: ${this.paddleY_}`);
		if (this.paddleY_ != this.target_.getY())
			this.movePaddleToTarget();
	}

	private resetBall() {
		this.target_.setY(0);
		this.lastBall_.setX(0);
		this.lastBall_.setY(0);
	}

	private handleGoal(score: number) {
		
	}

	private setCountdown(ticks: number) {
		this.countdown_ = ticks;
	}

	private accountForBounce(y: number): number {
		const adjustY = (field.TOP_EDGE_Y - Math.abs(y)) * 2;
		y += (y > 0) ? adjustY : -adjustY;
		return y;
	}

	private ballHitPaddle(): boolean {
		return this.ticksUntilTarget_ < this.REFRESH_RATE;
	}

	private ballVectorOrigin(): Point {
		if (this.ballHitPaddle())
			return new Point(this.target_.getX(), this.target_.getY());
		return new Point(this.lastBall_.getX(), this.lastBall_.getY());
	}

	private provisionalTarget(ballPosition: Point) {
		const origin = this.ballVectorOrigin();
		const distance = distanceBetweenPoints(origin, ballPosition);
		console.log(`distance between ${origin.getX()} ${origin.getY()} and ball: ${distance}`);
		if (this.ballBounced(distance))
			ballPosition.setY(this.accountForBounce(ballPosition.getY()));
		console.log(`ball position after bounce correction: ${ballPosition.getX()} ${ballPosition.getY()}`);
		if (this.ballHitPaddle())
			this.target_.setX(-this.target_.getX());
		this.target_.setY(findIntersectionWithVerticalLine(origin, ballPosition, this.target_.getX()));
		console.log(`provisional target x : ${this.target_.getX()}, y : ${this.target_.getY()} based on ball position ${ballPosition.getX()} ${ballPosition.getY()}`);
	}

	private calculateTicks(ballPosition: Point) {
		this.ticksUntilTarget_ = Math.round(distanceBetweenPoints(ballPosition, this.target_) / this.BALL_SPEED);
		this.ticksAfterTarget_ = this.REFRESH_RATE - this.ticksUntilTarget_;
	}

	private updateLastBall(ballPosition: Point) {
		this.lastBall_.setX(ballPosition.getX());
		this.lastBall_.setY(ballPosition.getY());
	}
	
	private calculateTarget(ballPosition: Point) {
		this.provisionalTarget(ballPosition);
		this.calculateTicks(ballPosition);
		while (this.target_.getY() > field.TOP_EDGE_Y || this.target_.getY() < field.BOTTOM_EDGE_Y)
			this.target_.setY(this.accountForBounce(this.target_.getY()));
		this.countdown_ = this.REFRESH_RATE;
		this.updateLastBall(ballPosition);
	}
	
	private ballBounced(distance: number): boolean {
		const expectedDistance = (this.ballHitPaddle()) ? this.ticksAfterTarget_ : this.REFRESH_RATE;
		return Math.round(distance / this.BALL_SPEED) - expectedDistance < 0;
	}
	
	private ballGoesAway(deltaX: number) {
		return (this.side_ * deltaX < 0); //if both positive or both negative that means ball is going towards AI paddle
	}

	private movePaddleToTarget(delay = 1, moves = 0) {
		let moveCommand = {move: "", paddle: ""};

		moveCommand.paddle = (this.side_ < 0) ? "left" : "right";
		moveCommand.move = (this.paddleY_ < this.target_.getY()) ? "up" : "down";

		while (this.paddleY_ > this.target_.getY() + this.STEP) {
			setTimeout(this.sendMove, delay * moves++, this.ws_, moveCommand);
			this.paddleY_ -= this.STEP;
		}
		while (this.paddleY_ < this.target_.getY() - this.STEP) {
			setTimeout(this.sendMove, delay * moves++, this.ws_, moveCommand);
			this.paddleY_ += this.STEP;
		}
	}

	private seeBall(ballPosition: Point): boolean {
		return (this.side_ - ballPosition.getX() <= this.difficulty_);
	}

	private sendMove(ws: WebSocket, moveCommand: any) {
		ws.send(JSON.stringify(moveCommand));
		// console.log(moveCommand);
	}
}

const field = new PongField;

//difficulty means the fraction of the pong table that the AI can "see"
const difficultySelector = new Map<string, number>([
	["easy", 0.5 * field.TABLE_LENGHT_X], 
	["medium", 0.75 * field.TABLE_LENGHT_X],
	["hard", 1 * field.TABLE_LENGHT_X],
]);
