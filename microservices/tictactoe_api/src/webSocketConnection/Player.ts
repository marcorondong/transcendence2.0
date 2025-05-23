import { Game } from "./Game";
import {
	zodIndexResponse,
	zodSetupResponse,
	zodErrorResponse,
	zodGameOverResponse,
} from "./zodSchema";
import { getHeadToHeadStats, postResult } from "./httpRequests";

export class Player {
	private readonly id: string;
	private nickname: string;
	private readonly socket: WebSocket;
	private opponentPlayer: Player | null = null;
	private sign: string = "";
	private disconnected: boolean = true;
	private game: Game | null = null;

	constructor(id: string, nickname: string, socket: WebSocket) {
		this.id = id;
		this.nickname = nickname;
		this.socket = socket;
	}

	getId(): string {
		return this.id;
	}

	getNickname(): string {
		return this.nickname;
	}

	setNickname(nickname: string): void {
		this.nickname = nickname;
	}

	getSocket(): WebSocket {
		return this.socket;
	}

	getOpponentPlayer(): Player | null {
		return this.opponentPlayer;
	}

	getSign(): string {
		return this.sign;
	}

	getGame(): Game | null {
		return this.game;
	}

	getOpponentId(): string | null {
		if (this.opponentPlayer) {
			return this.opponentPlayer.getId();
		}
		return null;
	}

	getTurn(): string {
		if (this.game?.getCurrentTurn() === this) return "Your turn";
		else return "Opponent's turn";
	}

	getDisconnected(): boolean {
		return this.disconnected;
	}

	setDisconnected(disconnected: boolean): void {
		this.disconnected = disconnected;
	}

	changeTurn(): void {
		if (this.opponentPlayer) this.game?.setCurrentTurn(this.opponentPlayer);
	}

	async sendSetup() {
		try {
			const stats = await getHeadToHeadStats(this.id, this.getOpponentId()!);
			const setupResponse = zodSetupResponse.parse({
				gameSetup: true,
				userId: this.id,
				opponentId: this.getOpponentId(),
				sign: this.sign,
				turn: this.getTurn(),
				wins: stats.wins,
				losses: stats.losses,
				draws: stats.draws,
				total: stats.total,
			});
			this.socket.send(JSON.stringify(setupResponse));
		} catch (error) {
			console.error("Error sending setup:", error); // TODO remove this in production
			this.sendError(`Error sending setup: ${error}`); // TODO remove this in production
			this.setDisconnected(false);
			this.socket.close(4000, "Error sending setup");
		}
	}

	sendIndex(index: number): void {
		if (this.opponentPlayer) {
			if (this.game?.setBoard(index, this)) {
				this.changeTurn();
				const indexResponse = zodIndexResponse.parse({
					index: index,
					sign: this.sign,
					turn: this.getTurn(),
				});
				const opponentIndexResponse = zodIndexResponse.parse({
					index: index,
					sign: this.sign,
					turn: this.opponentPlayer.getTurn(),
				});
				this.socket.send(JSON.stringify(indexResponse));
				this.opponentPlayer
					.getSocket()
					.send(JSON.stringify(opponentIndexResponse));
				this.game.checkWin(this);
			}
		}
		else {
			this.sendError("Opponent not found");
		}
	}

	sendError(message: string): void {
		const errorResponse = zodErrorResponse.parse({
			error: message,
		});
		this.socket.send(JSON.stringify(errorResponse));
	}

	sendGameOver(message: string): void {
		const gameOverResponse = zodGameOverResponse.parse({
			gameOver: message,
		});
		this.socket.send(JSON.stringify(gameOverResponse));
	}

	finishSetup(opponentPlayer: Player): void {
		const sign = Math.random() < 0.5 ? "X" : "O";
		const game = new Game();
		this.opponentPlayer = opponentPlayer;
		this.sign = sign;
		this.game = game;
		opponentPlayer.opponentPlayer = this;
		opponentPlayer.sign = sign === "X" ? "O" : "X";
		opponentPlayer.game = game;
		if (sign === "X") {
			this.game.setCurrentTurn(this);
		} else {
			this.game.setCurrentTurn(opponentPlayer);
		}
		this.sendSetup();
		opponentPlayer.sendSetup();
	}

	async opponentDisconnected() {
		try {
			if (this.sign === "X")
				await postResult(this.id, this.opponentPlayer?.getId()!, this.sign);
			else
				await postResult(this.opponentPlayer?.getId()!, this.id, this.sign)
			this.sendGameOver("Opponent disconnected. You win!");
			this.disconnected = false;
			this.socket.close();
		} catch (error) {
			console.error("Error handling opponent disconnect:", error); // TODO remove this in production
			this.sendError(`Error handling opponent disconnect: ${error}`); // TODO remove this in production
			this.setDisconnected(false);
			this.socket.close(4000, "Error handling opponent disconnect");
		}
	}
}
