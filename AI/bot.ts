import { WebSocket, RawData } from 'ws';
import { PongField } from '../ssg/pong-api/src/game/PongField';
import { Point } from '../ssg/pong-api/src/game/Point';
import { getTrailingCommentRanges } from 'typescript';
import "./geometryUtils";
import { findIntersectionWithVerticalLine } from './geometryUtils';

export class Bot
{
	private readonly roomId_: string;
	private readonly port_: string;
	private readonly host_: string;
	private readonly side_: number;
	private readonly difficulty_: number;
	private ws_: WebSocket;
	private readonly REFRESH_RATE = 60;
	private readonly STEP = 0.05;
	private readonly BALL_SPEED = 0.1;
	private countdown_: number;
	private lastBall_: Point;
	private paddleY_: number;
	private targetY_: number;

	constructor(data: string) {
		const initializers = JSON.parse(data);
		this.difficulty_ = difficultySelector.get(initializers.difficulty) ?? 2;
		this.roomId_ = initializers.roomId;
		this.host_ = (initializers.host) ?? "127.0.0.1";
		this.port_ = (initializers.port) ?? "3010";
		this.side_ = (initializers.side === "left") ? field.LEFT_EDGE_X + 0.5 : field.RIGHT_EDGE_X - 0.5;
		this.countdown_ = 1;
		this.lastBall_ = new Point(0, 0);
		this.paddleY_ = 0;
		this.targetY_ = 0;
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
			console.error(`Failed to initialize WebSocket at ${this.host_}:${this.port_}:`, error);
		}
	}

	private handleEvent(event: any) {
		if (--this.countdown_)
			return ;
		try {
			const gameState = JSON.parse(event.toString());
			const ballPosition = new Point(gameState.ball.x, gameState.ball.y);
			const paddlePosition = (this.side_ < 0)
			? new Point(gameState.leftPaddle.x, gameState.leftPaddle.y)
			: new Point(gameState.rightPaddle.x, gameState.rightPaddle.y);

			if (this.seeBall(ballPosition))
			{
				this.paddleY_ = paddlePosition.getY();
				this.calculateTarget(ballPosition.getX(), ballPosition.getY());
				this.lastBall_ = ballPosition;
				this.countdown_ = this.REFRESH_RATE;
				console.log(`target y : ${this.targetY_}, paddleY: ${this.paddleY_}`);
				if (this.paddleY_ != this.targetY_)
					this.setMove();
			}
			
		} catch (error) {
			console.error('Error parsing message:', error);
		}
	}
	
	private calculateTarget(x: number, y: number) {
		this.targetY_ = 0;
		const distance = Point.calculateVectorSpeed(Point.calculateVector(this.lastBall_, new Point(x, y)));
		console.log(`distance: ${distance}
					last: ${this.lastBall_.getX()}, ${this.lastBall_.getY()}
					current: ${x}, ${y}`);
		if (this.ballBounced(distance))
		{
			this.bounceCalculation();
		}
		else
		{
			this.linearCalculation(x, y);
		}

	}
	
	private ballBounced(distance: number) {
		return Math.abs(distance - (this.BALL_SPEED * this.REFRESH_RATE)) > this.BALL_SPEED;
	}
	
	private ballGoesAway(deltaX: number) {
		return (this.side_ * deltaX < 0); //if both positive or both negative that means ball is going towards AI paddle
	}
	
	private linearCalculation(newX: number, newY: number) {
		const deltaY = newY - this.lastBall_.getY();
		const deltaX = newX - this.lastBall_.getX();
		if (this.ballGoesAway(deltaX))
		{
			console.log("ball away");
			console.log(deltaX);
			console.log(deltaY);
			return;
		}
		else
		{
			let bigTarget = Math.round((newY + deltaY) * 20);
			if (bigTarget > 50)
				bigTarget -= bigTarget - 50;
			else if (bigTarget < -50)
				bigTarget -= 50 + bigTarget;
			this.targetY_ = bigTarget / 20;
		}
	}

	private bounceCalculation() {

	}

	private setMove(delay = 1, moves = 0) {
		let moveCommand = {move: "", paddle: ""};

		moveCommand.paddle = (this.side_ < 0) ? "left" : "right";
		moveCommand.move = (this.paddleY_ < this.targetY_) ? "up" : "down";

		while (this.paddleY_ > this.targetY_ + this.STEP) {
			setTimeout(this.sendMove, delay * moves++, this.ws_, moveCommand);
			this.paddleY_ -= this.STEP;
		}
		while (this.paddleY_ < this.targetY_ - this.STEP) {
			setTimeout(this.sendMove, delay * moves++, this.ws_, moveCommand);
			this.paddleY_ += this.STEP;
		}
	}

	private seeBall(ballPosition: Point): boolean {
		return (this.side_ - ballPosition.getX() <= this.difficulty_);
	}

	private sendMove(ws: WebSocket, moveCommand: any) {
		ws.send(JSON.stringify(moveCommand));
		console.log(moveCommand);
	}
}

const field = new PongField;

//difficulty means the fraction of the pong table that the AI can "see"
const difficultySelector = new Map<string, number>([
	["easy", 0.5 * field.TABLE_LENGHT_X], 
	["medium", 0.75 * field.TABLE_LENGHT_X],
	["hard", 1 * field.TABLE_LENGHT_X],
]);
