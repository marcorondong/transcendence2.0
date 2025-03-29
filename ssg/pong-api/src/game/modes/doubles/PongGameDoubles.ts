import { IPongFrameSingles} from "../singles/PongGameSingles"
import { IPaddleJson, Paddle } from "../../elements/Paddle"
import { Ball } from "../../elements/Ball"
import { PongField } from "../../elements/PongField"
import { ScoreBoard } from "../../elements/ScoreBoard"
import { Point } from "../../elements/Point"
import { EPlayerRole } from "../../PongPlayer"
import { APongGame} from "../APongGame"


export interface IPongFrameDoubles extends IPongFrameSingles
{
	leftSecondPaddle: IPaddleJson;
	rightSecondPaddle: IPaddleJson;
}

export class PongGameDoubles extends APongGame
{
	private leftPaddleOne: Paddle;
	private leftPaddletwo: Paddle;
	private rightPaddleOne: Paddle;
	private rightPaddletwo: Paddle;

	constructor(leftPaddle: Paddle, leftTwo: Paddle, rightPaddle: Paddle, rightTwo: Paddle, ball: Ball, score: ScoreBoard, tableField: PongField)
	{
		super(ball,score,tableField);
		this.leftPaddleOne = leftPaddle;
		this.leftPaddletwo = leftTwo;
		this.rightPaddleOne = rightPaddle;
		this.rightPaddletwo = rightTwo;
	}

	static createStandardGameDoubles(): PongGameDoubles
	{
		const leftPaddle: Paddle = new Paddle(new Point(-3.5, 1.25), 0.5);
		const leftPaddletwo: Paddle = new Paddle(new Point(-4, -1.25), 0.5);
		const rightPaddle: Paddle = new Paddle(new Point(3.5, 1.25), 0.5);
		const rightPaddletwo: Paddle = new Paddle(new Point(4, -1.25), 0.5);
		const ball: Ball = new Ball(new Point(0, 1.25));
		const table: PongField = new PongField();
		const score: ScoreBoard = new ScoreBoard();
		const game: PongGameDoubles = new PongGameDoubles(leftPaddle, leftPaddletwo , rightPaddle, rightPaddletwo, ball, score, table);
		return game;
	}

	resetPaddlePosition(): void {
		this.leftPaddleOne.resetPosition();
		this.leftPaddletwo.resetPosition();
		this.rightPaddleOne.resetPosition();
		this.rightPaddletwo.resetPosition();
	}

	getFrameDoubles(): IPongFrameDoubles {
		const baseFrame = super.getBaseFrame();
		return {
			...baseFrame,
			leftSecondPaddle: this.leftPaddletwo.getPaddleJson(),
			leftPaddle: this.leftPaddleOne.getPaddleJson(),
			rightSecondPaddle: this.rightPaddletwo.getPaddleJson(),
			rightPaddle: this.rightPaddleOne.getPaddleJson()
		}
		
	}

	getPaddle(role: EPlayerRole): Paddle
	{
		switch (role)
		{
			case EPlayerRole.LEFT_ONE:
				return this.leftPaddleOne;
			case EPlayerRole.RIGHT_ONE:
				return this.rightPaddleOne;
			case EPlayerRole.LEFT_TWO:
				return this.leftPaddletwo;
			case EPlayerRole.RIGHT_TWO:
				return this.rightPaddletwo;
			default:
				throw new Error("Role undefined");
		}
	}

	getCloserLeftPaddle(): Paddle
	{
		const firstDistance = Point.calculateDistance(this.leftPaddleOne.getPosition(), this.ball.getPosition());
		const secondDistance = Point.calculateDistance(this.leftPaddletwo.getPosition(), this.ball.getPosition());
		if(firstDistance < secondDistance)
			return this.leftPaddleOne;
		return this.leftPaddletwo;
	}

	getCloserRightPaddle(): Paddle
	{
		const firstDistance = Point.calculateDistance(this.rightPaddleOne.getPosition(), this.ball.getPosition());
		const secondDistance = Point.calculateDistance(this.rightPaddletwo.getPosition(), this.ball.getPosition());
		if(firstDistance < secondDistance)
			return this.rightPaddleOne;
		return this.rightPaddletwo;
	}

	protected ballMovementMechanics(): void
	{
		if(this.topEdgeCollision() || this.bottomEdgeCollision())
			return this.ball.simpleBounceY();
		if(this.ball.isMovingLeft())
		{
			return this.sideMechanics("left", this.getCloserLeftPaddle());
		}
		if(this.ball.isMovingRight())
		{
			return this.sideMechanics("right", this.getCloserRightPaddle());
		}	
	}
}