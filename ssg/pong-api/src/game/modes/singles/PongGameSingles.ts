import { IPaddleJson, Paddle } from "../../elements/Paddle";
import { Ball } from "../../elements/Ball";
import { Point } from "../../elements/Point";
import { ScoreBoard } from "../../elements/ScoreBoard";
import { PongField } from "../../elements/PongField";
import { EPlayerRole, ETeamSideFiltered } from "../../PongPlayer";
import { APongGame, IPongFrameBase } from "../APongGame";
import { pongDbConfig } from "../../../config";

export interface IPongFrameSingles extends IPongFrameBase {
	leftPaddle: IPaddleJson;
	rightPaddle: IPaddleJson;
}

export interface IPongSinglesDatabase {
	winnerId: string;
	loserId: string;
	winnerScore: number;
	loserScore: number;
	gameId: string;
}

export class PongGameSingles extends APongGame {
	protected leftPaddle: Paddle;
	protected rightPaddle: Paddle;

	constructor(
		leftPaddle: Paddle,
		rightPaddle: Paddle,
		ball: Ball,
		score: ScoreBoard,
		tableField: PongField,
	) {
		super(ball, score, tableField);
		this.leftPaddle = leftPaddle;
		this.rightPaddle = rightPaddle;
	}

	static createStandardGame(): PongGameSingles {
		const leftPaddle: Paddle = new Paddle(new Point(-4, 0));
		const rightPaddle: Paddle = new Paddle(new Point(4, 0));
		const ball: Ball = new Ball(new Point(0, 0));
		const table: PongField = new PongField();
		const score: ScoreBoard = new ScoreBoard();
		const game: PongGameSingles = new PongGameSingles(
			leftPaddle,
			rightPaddle,
			ball,
			score,
			table,
		);
		return game;
	}

	getJsonDataForDatabase(): IPongSinglesDatabase {
		//TODO implement proper IDs of winner and loser not just side
		return {
			gameId: this.getGameId(),
			winnerId: this.score.getWinnerSideString(),
			loserId: this.score.getLoserSideString(),
			winnerScore: this.score.getWinnerGoals(),
			loserScore: this.score.getLoserGoals(),
		};
	}

	async storeResultInDatabase(): Promise<void> {
		//TODO: implement properIds
		const url: string = pongDbConfig.store_game_endpoint;
		const gameData = this.getJsonDataForDatabase();
		console.log("Game data");
		console.log(gameData);
		console.log(`Storing game to database on url ${url}: `);
		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(gameData),
			});
			if (!response.ok)
				throw new Error(
					`Game data is not stored in database: ${response.status}`,
				);
			const status = await response.json();
			console.log("Server Response:", status);
		} catch (error) {
			console.error(`❌ Failed to store to database: ${error}`);
		}
	}

	getCloserLeftPaddle(): Paddle {
		return this.leftPaddle;
	}

	getCloserRightPaddle(): Paddle {
		return this.rightPaddle;
	}

	getPaddle(role: EPlayerRole): Paddle {
		if (role === EPlayerRole.LEFT_ONE) return this.leftPaddle;
		else if (role === EPlayerRole.RIGHT_ONE) return this.rightPaddle;
		throw Error("paddle not found");
	}

	resetPaddlePosition(): void {
		this.leftPaddle.resetPosition();
		this.rightPaddle.resetPosition();
	}

	getFrame(): IPongFrameSingles {
		const baseFrame: IPongFrameBase = this.getBaseFrame();
		return {
			...baseFrame,
			leftPaddle: this.leftPaddle.getPaddleJson(),
			rightPaddle: this.rightPaddle.getPaddleJson(),
		};
	}

	getScoreBoard(): ScoreBoard {
		return this.score;
	}
}
