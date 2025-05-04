import { IPongFrameSingles } from "../singles/PongGameSingles";
import { IPaddleJson, Paddle } from "../../elements/Paddle";
import { Ball } from "../../elements/Ball";
import { PongField } from "../../elements/PongField";
import { ScoreBoard } from "../../elements/ScoreBoard";
import { Point } from "../../elements/Point";
import { EPlayerRole } from "../../PongPlayer";
import { APongGame } from "../APongGame";
import { paddleConfig } from "../../../../config";

export interface IPongFrameDoubles extends IPongFrameSingles {
	leftSecondPaddle: IPaddleJson;
	rightSecondPaddle: IPaddleJson;
}

export class PongGameDoubles extends APongGame {
	private leftPaddleOne: Paddle;
	private leftPaddleTwo: Paddle;
	private rightPaddleOne: Paddle;
	private rightPaddleTwo: Paddle;

	constructor(
		leftPaddle: Paddle,
		leftTwo: Paddle,
		rightPaddle: Paddle,
		rightTwo: Paddle,
		ball: Ball,
		score: ScoreBoard,
		tableField: PongField,
	) {
		super(ball, score, tableField);
		this.leftPaddleOne = leftPaddle;
		this.leftPaddleTwo = leftTwo;
		this.rightPaddleOne = rightPaddle;
		this.rightPaddleTwo = rightTwo;
	}

	static createStandardGameDoubles(): PongGameDoubles {
		const leftPaddle: Paddle = new Paddle(new Point(-3.5, 1.25), paddleConfig.height_doubles);
		const leftPaddleTwo: Paddle = new Paddle(new Point(-4, -1.25), paddleConfig.height_doubles);
		const rightPaddle: Paddle = new Paddle(new Point(3.5, 1.25), paddleConfig.height_doubles);
		const rightPaddleTwo: Paddle = new Paddle(new Point(4, -1.25), paddleConfig.height_doubles);
		const ball: Ball = new Ball(new Point(0, 1.25));
		const table: PongField = new PongField();
		const score: ScoreBoard = new ScoreBoard();
		const game: PongGameDoubles = new PongGameDoubles(
			leftPaddle,
			leftPaddleTwo,
			rightPaddle,
			rightPaddleTwo,
			ball,
			score,
			table,
		);
		return game;
	}

	//TODO implement version of double mode to database
	async storeResultInDatabase(): Promise<void> {
		return;
	}

	resetPaddlePosition(): void {
		this.leftPaddleOne.resetPosition();
		this.leftPaddleTwo.resetPosition();
		this.rightPaddleOne.resetPosition();
		this.rightPaddleTwo.resetPosition();
	}

	getFrameDoubles(): IPongFrameDoubles {
		const baseFrame = super.getBaseFrame();
		return {
			...baseFrame,
			leftSecondPaddle: this.leftPaddleTwo.getPaddleJson(),
			leftPaddle: this.leftPaddleOne.getPaddleJson(),
			rightSecondPaddle: this.rightPaddleTwo.getPaddleJson(),
			rightPaddle: this.rightPaddleOne.getPaddleJson(),
		};
	}

	getPaddle(role: EPlayerRole): Paddle {
		switch (role) {
			case EPlayerRole.LEFT_ONE:
				return this.leftPaddleOne;
			case EPlayerRole.RIGHT_ONE:
				return this.rightPaddleOne;
			case EPlayerRole.LEFT_TWO:
				return this.leftPaddleTwo;
			case EPlayerRole.RIGHT_TWO:
				return this.rightPaddleTwo;
			default:
				throw new Error("Role undefined");
		}
	}

	getCloserLeftPaddle(): Paddle {
		const firstDistance = Point.calculateDistance(
			this.leftPaddleOne.getPosition(),
			this.ball.getPosition(),
		);
		const secondDistance = Point.calculateDistance(
			this.leftPaddleTwo.getPosition(),
			this.ball.getPosition(),
		);
		if (firstDistance < secondDistance) return this.leftPaddleOne;
		return this.leftPaddleTwo;
	}

	getCloserRightPaddle(): Paddle {
		const firstDistance = Point.calculateDistance(
			this.rightPaddleOne.getPosition(),
			this.ball.getPosition(),
		);
		const secondDistance = Point.calculateDistance(
			this.rightPaddleTwo.getPosition(),
			this.ball.getPosition(),
		);
		if (firstDistance < secondDistance) return this.rightPaddleOne;
		return this.rightPaddleTwo;
	}

	protected ballMovementMechanics(): void {
		if (this.topEdgeCollision() || this.bottomEdgeCollision())
			return this.ball.simpleBounceY();
		if (this.ball.isMovingLeft()) {
			return this.sideMechanics("left", this.getCloserLeftPaddle());
		}
		if (this.ball.isMovingRight()) {
			return this.sideMechanics("right", this.getCloserRightPaddle());
		}
	}
}
