import { WebSocket, RawData } from 'ws';
import { PongField } from '../ssg/pong-api/src/game/PongField';
import { Point } from '../ssg/pong-api/src/game/Point';

export class Bot
{
	private readonly roomId_: string;
	private readonly port_: string;
	private readonly host_: string;
	private readonly side_: number;
	private readonly difficulty_: number;
	private ws_: WebSocket | null = null;

	constructor(data: string) {
		const initializers = JSON.parse(data);
		this.difficulty_ = difficultySelector.get(initializers.difficulty) ?? 2;
		this.roomId_ = initializers.roomId;
		this.host_ = (initializers.host) ?? "127.0.0.1";
		this.port_ = (initializers.port) ?? "3010";
		this.side_ = (initializers.side === "left") ? field.LEFT_EDGE_X : field.RIGHT_EDGE_X;

		try {
			this.ws_ = new WebSocket(`wss://${this.host_}:${this.port_}/pong/`, {rejectUnauthorized: false });
	
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
		if (this.ws_ == null)
			return ;
		try {
			const gameState = JSON.parse(event.toString());
	
			const ballPosition = new Point(gameState.ball.x, gameState.ball.y);
			const paddlePosition = (this.side_ < 0) ? new Point(gameState.leftPaddle.x, gameState.leftPaddle.y)
													: new Point(gameState.rightPaddle.x, gameState.rightPaddle.y);

			if (this.seeBall(ballPosition))
				this.sendMove(ballPosition.getY(), paddlePosition.getY());
		} catch (error) {
			console.error('Error parsing message:', error);
		}
	}

	private sendMove(ballY: number, paddleY: number) {
		let moveCommand = {move: "", paddle: ""};
	
		moveCommand.paddle = (this.side_ < 0) ? "left" : "right";

		if (paddleY < ballY - 0.05) {
			moveCommand.move = "up";
		} else if (paddleY > ballY + 0.05) {
			moveCommand.move = "down";
		}
		
		if (moveCommand && this.ws_ != null) {
			this.ws_.send(JSON.stringify(moveCommand));
		}
	}

	private seeBall(ballPosition: Point): boolean {
		return (this.side_ - ballPosition.getX() <= this.difficulty_);
	}
}

const field = new PongField;

const difficultySelector = new Map<string, number>([
	["easy", field.TABLE_LENGHT_X / 4 * 2],
	["medium", field.TABLE_LENGHT_X / 4 * 3],
	["hard", field.TABLE_LENGHT_X / 4 * 4],
]);
