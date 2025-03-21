import { PongGame } from "../singles/PongGame"
import { Paddle } from "../../elements/Paddle"
import { Ball } from "../../elements/Ball"
import { PongField } from "../../elements/PongField"
import { ScoreBoard } from "../../elements/ScoreBoard"
import { Point } from "../../elements/Point"

export class PongGameDoubles extends PongGame
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
		const leftPaddle: Paddle = new Paddle(new Point(-4, 1.25), 0.5);
		const leftPaddletwo: Paddle = new Paddle(new Point(-4, -1.25), 0.5);
		const rightPaddle: Paddle = new Paddle(new Point(4, 1.25));
		const rightPaddletwo: Paddle = new Paddle(new Point(4, -1.25), 0.5);
		const ball: Ball = new Ball(new Point(0, 0));
		const table: PongField = new PongField();
		const score: ScoreBoard = new ScoreBoard();
		const game: PongGameDoubles = new PongGameDoubles(leftPaddle,leftPaddletwo ,rightPaddle, rightPaddletwo, ball, score, table);
		return game;
	}
}