import { IPongFrame, PongGameSingles, Position } from "../singles/PongGameSingles"
import { Paddle } from "../../elements/Paddle"
import { Ball } from "../../elements/Ball"
import { PongField } from "../../elements/PongField"
import { ScoreBoard } from "../../elements/ScoreBoard"
import { Point } from "../../elements/Point"
import { EPlayerRole } from "../../PongPlayer"


export interface IPongFrameDoubles extends IPongFrame
{
	leftSecondPaddle: Position & {height:number};
	rightSecondPaddle: Position & {height:number};
}

export class PongGameDoubles extends PongGameSingles
{
	private leftPaddletwo: Paddle;
	private rightPaddletwo: Paddle;

	constructor(leftPaddle: Paddle, leftTwo: Paddle, rightPaddle: Paddle, rightTwo:Paddle, ball:Ball, score:ScoreBoard, tableField:PongField)
	{
		super(leftPaddle, rightPaddle, ball, score, tableField);
		this.leftPaddletwo = leftTwo;
		this.rightPaddletwo = rightTwo;
	}

	static createStandardGameDobules(): PongGameDoubles
	{
		const leftPaddle: Paddle = new Paddle(new Point(-3.5, 1.25), 0.5);
		const leftPaddletwo: Paddle = new Paddle(new Point(-4, -1.25), 0.5);
		const rightPaddle: Paddle = new Paddle(new Point(3.5, 1.25), 0.5);
		const rightPaddletwo: Paddle = new Paddle(new Point(4, -1.25), 0.5);
		const ball: Ball = new Ball(new Point(0, 1.25));
		const table: PongField = new PongField();
		const score: ScoreBoard = new ScoreBoard();
		const game: PongGameDoubles = new PongGameDoubles(leftPaddle,leftPaddletwo ,rightPaddle, rightPaddletwo, ball, score, table);
		return game;
	}

	getFrameDoubles(): IPongFrameDoubles {
		const baseFrame = super.getFrame();
		return {
			...baseFrame,
			leftSecondPaddle:
			{
				x: this.leftPaddletwo.getPosition().getX(),
				y: this.leftPaddletwo.getPosition().getY(),
				height: this.leftPaddletwo.height
			},
			rightSecondPaddle:
			{
				x: this.rightPaddletwo.getPosition().getX(),
				y: this.rightPaddletwo.getPosition().getY(),
				height: this.rightPaddletwo.height
			}
		}
		
	}

	getPaddle(role: EPlayerRole): Paddle
	{
		switch (role)
		{
			case EPlayerRole.LEFT_ONE:
				return this.leftPaddle;
			case EPlayerRole.RIGHT_ONE:
				return this.rightPaddle;
			case EPlayerRole.LEFT_TWO:
				return this.leftPaddletwo;
			case EPlayerRole.RIGHT_TWO:
				return this.rightPaddletwo;
			default:
				throw new Error("Role undefined");
		}
	}

	private closerLeftPaddle():Paddle
	{
		const firstDistance = Point.calculateDistance(this.leftPaddle.getPosition(), this.ball.getPosition());
		const secondDistance = Point.calculateDistance(this.leftPaddletwo.getPosition(), this.ball.getPosition());
		if(firstDistance < secondDistance)
			return this.leftPaddle;
		return this.leftPaddletwo;
	}

	private closerRightPaddle():Paddle
	{
		const firstDistance = Point.calculateDistance(this.rightPaddle.getPosition(), this.ball.getPosition());
		const secondDistance = Point.calculateDistance(this.rightPaddletwo.getPosition(), this.ball.getPosition());
		if(firstDistance < secondDistance)
			return this.rightPaddle;
		return this.rightPaddletwo;
	}

	protected ballMovementMechanics(): void
	{
		if(this.topEdgeCollision() || this.bottomEdgeCollision())
			return this.ball.simpleBounceY();
		if(this.ball.isMovingLeft())
		{
			return this.sideMechanics("left", this.closerLeftPaddle());
		}
		if(this.ball.isMovingRight())
		{
			return this.sideMechanics("right", this.closerRightPaddle());
		}	
	}
}