import { WebSocket, RawData } from 'ws';
import { PongField } from './PongField';
import { Point } from './Point';
import { getTrailingCommentRanges } from 'typescript';
import { distanceBetweenPoints, findIntersectionWithVerticalLine, roundTo } from './geometryUtils';
import { count } from 'console';

export class Bot
{
//game dimensions
	private readonly FRAME_RATE = 60;
	private readonly STEP = 0.05;
	private readonly BALL_SPEED = 0.1;
	private readonly PADDLE_GAP = 0.5;
	
//room info
	private readonly roomId_: string;
	private readonly port_: string;
	private readonly host_: string;
	private readonly side_: number;
	private readonly difficulty_: number;
	private ws_: WebSocket | null;
	
//dynamic game state
	private leftScore_ = 0;
	private rightScore_ = 0;
	private paddleY_ = 0;
	private movePaddleTo_ = 0;
	private paddleTwist_ = 0;
	private countdown_ = this.FRAME_RATE;
	private moveCommand_ = {move: "", paddle: ""};
	private lastBall_: Point;
	private target_: Point;
	private framesAfterTarget_: number;
	private framesUntilTarget_: number;

	constructor(initializers: any) {
		this.difficulty_ = difficultySelector.get(initializers.difficulty) ?? 16;
		this.paddleTwist_ = paddleTwistSelector.get(initializers.difficulty) ?? 0;
		this.roomId_ = initializers.roomId;
		this.host_ = (initializers.host) ?? "127.0.0.1";
		this.port_ = (initializers.port) ?? "3010";
		this.side_ = (initializers.side === "left") ? field.LEFT_EDGE_X + this.PADDLE_GAP : field.RIGHT_EDGE_X - this.PADDLE_GAP;
		this.ws_ = null;
		
		this.lastBall_ = new Point(0, 0);
		this.target_ = new Point(field.LEFT_EDGE_X + this.PADDLE_GAP, 0);
		this.framesUntilTarget_ = Math.round(Math.abs(this.target_.getX()) / this.BALL_SPEED);
		this.framesAfterTarget_ = this.FRAME_RATE - this.framesUntilTarget_;
		this.moveCommand_.paddle = (this.side_ < 0) ? "left" : "right";
		
	}
	
	public playGame() {
		this.ws_ = new WebSocket(`wss://${this.host_}:${this.port_}/pong/`, {rejectUnauthorized: false });

		try {
	
			this.ws_.on('open', () => {
				console.log(`Connected to Pong WebSocket at ${this.host_}:${this.port_} for room ${this.roomId_}`);
			});
	
			this.ws_.on('error', (event: any) => {
				console.error(JSON.stringify(event));
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
	
	public handleEvent(event: any) {
		if (--this.countdown_)
			return ;
		
		const gameState = JSON.parse(event.toString());
		console.log(gameState);
		this.countdown_ = this.FRAME_RATE;
		
		const ballPosition = new Point(roundTo(gameState.ball.x, 2), roundTo(gameState.ball.y, 2));
		this.paddleY_ = (this.side_ < 0) ? roundTo(gameState.leftPaddle.y, 2) : roundTo(gameState.rightPaddle.y, 2);
		
		this.handleScore(gameState.score);
		this.calculateTarget(ballPosition);
		this.logAIState();
		
		if (this.paddleY_ != this.movePaddleTo_)
			this.makeMove(this.difficulty_);
		else
			this.twistBall(this.paddleTwist_)
	}
	
	private async makeMove(delay: number) {
		if (!this.ws_)
			return ;
		this.moveCommand_.move = (this.paddleY_ < this.movePaddleTo_) ? "up" : "down";
		
		while (this.paddleY_ > this.movePaddleTo_ + this.STEP + this.paddleTwist_) {
			this.paddleY_ -= this.STEP;
			this.ws_.send(JSON.stringify(this.moveCommand_));
			await sleep(delay);
		}
		while (this.paddleY_ < this.movePaddleTo_ - this.STEP - this.paddleTwist_) {
			this.paddleY_ += this.STEP;
			this.ws_.send(JSON.stringify(this.moveCommand_));
			await sleep(delay);
		}
	}

	//point of this function is for the AI to leave the middle
	private async twistBall(twist: number) {
		if (!this.ws_)
			return;
		this.moveCommand_.move = "down";

		while (this.paddleY_ > this.movePaddleTo_ - twist)
		{
			this.paddleY_ -= this.STEP;
			this.ws_.send(JSON.stringify(this.moveCommand_));
			await sleep(this.difficulty_);
		}
	}
	
	private resetLastBallAfterGoal(x: number) {
		let lastBallCorrection = this.framesUntilTarget_ * this.BALL_SPEED + this.PADDLE_GAP;
		if (x > 0) lastBallCorrection = -lastBallCorrection;
		this.lastBall_.setX(lastBallCorrection);
		this.lastBall_.setY(0);
	}
	
	private resetAfterGoal(x: number) {
		this.target_.setX(x);
		this.target_.setY(0);
		this.resetLastBallAfterGoal(x);
		this.calculateframes(this.lastBall_);
	}
	
	private handleScore(score: any) {
		while (score.leftGoals !== this.leftScore_) {
			this.leftScore_++;
			this.resetAfterGoal(field.RIGHT_EDGE_X - this.PADDLE_GAP); //if left side scored, ball will go to the right
		}
		while (score.rightGoals !== this.rightScore_) {
			this.rightScore_++;
			this.resetAfterGoal(field.LEFT_EDGE_X + this.PADDLE_GAP);
		}
	}
	
	private accountForBounce(y: number): number {
		const adjustY = (field.TOP_EDGE_Y - Math.abs(y)) * 2;
		y += (y > 0) ? adjustY : -adjustY;
		return y;
	}
	
	private ballHitPaddle(): boolean {
		return this.framesUntilTarget_ < this.FRAME_RATE;
	}
	
	private ballVectorOrigin(): Point {
		if (this.ballHitPaddle())
			return new Point(this.target_.getX(), this.target_.getY());
		return new Point(this.lastBall_.getX(), this.lastBall_.getY());
	}
	
	private provisionalTarget(ballPosition: Point) {
		const origin = this.ballVectorOrigin();
		const distance = distanceBetweenPoints(origin, ballPosition);
		if (this.ballBounced(distance))
			ballPosition.setY(this.accountForBounce(ballPosition.getY()));
		if (this.ballHitPaddle())
			this.target_.setX(-this.target_.getX());
		this.target_.setY(findIntersectionWithVerticalLine(origin, ballPosition, this.target_.getX()));
	}
	
	private calculateframes(ballPosition: Point) {
		this.framesUntilTarget_ = Math.round(distanceBetweenPoints(ballPosition, this.target_) / this.BALL_SPEED);
		this.framesAfterTarget_ = this.FRAME_RATE - this.framesUntilTarget_;
	}
	
	private updateLastBall(ballPosition: Point) {
		this.lastBall_.setX(ballPosition.getX());
		this.lastBall_.setY(ballPosition.getY());
	}
	
	private calculateTarget(ballPosition: Point) {
		this.provisionalTarget(ballPosition);
		this.calculateframes(ballPosition);
		while (this.target_.getY() > field.TOP_EDGE_Y || this.target_.getY() < field.BOTTOM_EDGE_Y)
			this.target_.setY(this.accountForBounce(this.target_.getY()));
		this.movePaddleTo_ = (this.target_.getX() === this.side_) ? this.target_.getY() : 0;
		this.updateLastBall(ballPosition);
	}
	
	private ballBounced(distance: number): boolean {
		const expectedDistance = (this.ballHitPaddle()) ? this.framesAfterTarget_ : this.FRAME_RATE;
		return Math.round(distance / this.BALL_SPEED) < expectedDistance - 1;
	}
	private logAIState() {
		let AIState = {
			lastBall: {x: this.lastBall_.getX(), y: this.lastBall_.getY()},
			target: {x: this.target_.getX(), y: this.target_.getY()},
			framesUntilTarget: this.framesUntilTarget_,
			framesAfterTarget: this.framesAfterTarget_,
			ballHitPaddle: this.ballHitPaddle(),
		}
		console.log(AIState);
	}
}

function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const field = new PongField;

//difficulty number = delay between AI moves in ms
const difficultySelector = new Map<string, number>([
	["easy", 24], 
	["medium", 16], 
	["hard", 8],
	["insane", 0]
]);

//the AI will twist the ball. maximum twist = 0.5 a.k.a. half of paddle height 
const paddleTwistSelector = new Map<string, number>([
	["easy", 0], 
	["medium", 0.1], 
	["hard", 0.25],
	["insane", 0.45]
])
