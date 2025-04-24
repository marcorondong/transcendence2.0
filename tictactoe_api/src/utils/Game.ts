import { Player } from "./Player";
import { postResult } from "./dbUtils";
import {
	zodGameOverResponse,
	zodWarningResponse,
	zodErrorResponse,
} from "../webSocketConnection/zodSchema";

export class Game {
	private currentTurn: Player | null = null;
	private board: string[] = Array(9).fill("");

	getCurrentTurn(): Player | null {
		return this.currentTurn;
	}

	getBoard(): string[] {
		return this.board;
	}

	setCurrentTurn(player: Player): void {
		this.currentTurn = player;
	}

	sendWarning(player: Player, message: string): void {
		const warningResponse = zodWarningResponse.parse({
			warning: message,
		});
		player.getSocket().send(JSON.stringify(warningResponse));
	}

	sendError(player: Player, message: string): void {
		const errorResponse = zodErrorResponse.parse({
			error: message,
		});
		player.getSocket().send(JSON.stringify(errorResponse));
	}

	sendGameOver(player: Player, message: string): void {
		const gameOverResponse = zodGameOverResponse.parse({
			gameOver: message,
		});
		player.getSocket().send(JSON.stringify(gameOverResponse));
	}

	async winDetected(player: Player, opponent: Player) {
		this.sendGameOver(player, `You win!`);
		this.sendGameOver(opponent, `You lose!`);
		const playerSign = player.getSign();
		if (playerSign === "X") {
			const response = await postResult(
				player.getId(),
				opponent.getId(),
				playerSign,
			);
			if (!response) {
				console.error("Failed to save game result");
				this.sendError(player, "Failed to save game result");
				return;
			}
		} else {
			const response = await postResult(
				opponent.getId(),
				player.getId(),
				playerSign,
			);
			if (!response) {
				console.error("Failed to save game result");
				this.sendError(player, "Failed to save game result");
				return;
			}
		}
		player.setDisconnected(false);
		opponent.setDisconnected(false);
		player.getSocket().close();
		opponent.getSocket().close();
	}

	async drawDetected(player: Player, opponent: Player) {
		this.sendGameOver(player, "It's a draw!");
		this.sendGameOver(opponent, "It's a draw!");
		const playerSign = player.getSign();
		if (playerSign === "X") {
			await postResult(player.getId(), opponent.getId(), "DRAW");
		} else {
			await postResult(opponent.getId(), player.getId(), "DRAW");
		}
		player.setDisconnected(false);
		opponent.setDisconnected(false);
		player.getSocket().close();
		opponent.getSocket().close();
	}

	async checkWin(player: Player) {
		const opponent = player.getOpponentPlayer();
		if (!opponent) {
			return this.sendError(player, "Opponent not found");
		}
		const winningCombinations = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			[0, 4, 8],
			[2, 4, 6],
		];
		for (const combination of winningCombinations) {
			const [a, b, c] = combination;
			if (
				this.board[a] &&
				this.board[a] === this.board[b] &&
				this.board[a] === this.board[c]
			) {
				await this.winDetected(player, opponent);
				return;
			}
		}
		if (this.board.every((cell) => cell !== "")) {
			await this.drawDetected(player, opponent);
			return;
		}
	}

	setBoard(index: number, player: Player): boolean {
		if (this.currentTurn !== player) {
			this.sendWarning(player, "Not your turn");
			return false;
		}
		if (this.board[index] !== "") {
			this.sendWarning(player, "Cell already occupied");
			return false;
		}
		if (index < 0 || index > 8) {
			this.sendError(player, "Invalid cell");
			return false;
		}
		this.board[index] = player.getSign();
		return true;
	}
}
