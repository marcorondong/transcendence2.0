import { Paddle } from "../../elements/Paddle";
import { Ball } from "../../elements/Ball";
import { VectorDirection, Point } from "../../elements/Point";
import { ScoreBoard, IScore} from "../../elements/ScoreBoard";
import { PongField } from "../../elements/PongField";
import { EPlayerRole ,EPlayerRoleFiltered, ETeamSide, ETeamSideFiltered } from "../../PongPlayer";
import { APongGame, Position, EGameStatus, IPongFrameBase } from "../APongGame";


export interface IPongFrameSingles extends IPongFrameBase
{
	leftPaddle: Position & {height:number};
	rightPaddle: Position & {height:number};
}

export class PongGameSingles extends APongGame
{

	protected leftPaddle: Paddle;
	protected rightPaddle: Paddle;
	
	constructor(leftPaddle: Paddle, rightPaddle: Paddle, ball:Ball, score:ScoreBoard, tableField:PongField)
	{
		super(ball, score, tableField);
		this.leftPaddle = leftPaddle;
		this.rightPaddle = rightPaddle;
	}

	static createStandardGame() :PongGameSingles
	{
		const leftPaddle: Paddle = new Paddle(new Point(-4, 0));
		const rightPaddle: Paddle = new Paddle(new Point(4, 0));
		const ball: Ball = new Ball(new Point(0, 0));
		const table: PongField = new PongField();
		const score: ScoreBoard = new ScoreBoard();
		const game: PongGameSingles = new PongGameSingles(leftPaddle, rightPaddle, ball, score, table);
		return game;
	}

	getCloserLeftPaddle(): Paddle {
		return this.leftPaddle;
	}

	getCloserRightPaddle(): Paddle {
		return this.rightPaddle;
	}

	getPaddle(role: EPlayerRole): Paddle
	{
		if(role === EPlayerRole.LEFT_ONE)
			return this.leftPaddle;
		else if(role === EPlayerRole.RIGHT_ONE)
			return this.rightPaddle
		throw Error("paddle not found")
	}

	resetPaddlePosition(): void 
	{
		this.leftPaddle.resetPosition();
		this.rightPaddle.resetPosition();	
	}

	getFrame(): IPongFrameSingles
	{
		const baseFrame: IPongFrameBase = this.getBaseFrame();
		return {
			...baseFrame,
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
			}
		};
	}
}
