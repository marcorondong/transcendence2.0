import { th } from "@faker-js/faker/.";
import { Game } from "./Game";
import { get } from "http";

export class Player {
	private readonly id: string;
	private readonly socket: WebSocket;
	private opponentPlayer: Player | null = null;
	private sign: string = "";
	private disconnected: boolean = true;
	private game: Game | null = null;

	constructor(id: string, socket: WebSocket) {
		this.id = id;
		this.socket = socket;
	}

	getId(): string {
		return this.id;
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
		if(this.game?.getCurrentTurn() === this)
			return "Your turn";
		else
			return "Opponent's turn";
	}

	getDisconnected(): boolean {
		return this.disconnected;
	}

	setDisconnected(disconnected: boolean): void {
		this.disconnected = disconnected;
	}

	changeTurn(): void {
		if (this.opponentPlayer)
			this.game?.setCurrentTurn(this.opponentPlayer);
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
		}
		else {
			this.game.setCurrentTurn(opponentPlayer);
		}
		this.sendSetup();
		opponentPlayer.sendSetup();
	}

	sendSetup(): void {
		// console.log("sign:", this.sign, "\nturn:", this.getTurn()); // TODO remove this in production
		this.socket.send(
			JSON.stringify({
				gameSetup: true,
				userId: this.id,
				opponentId: this.getOpponentId(),
				sign: this.sign,
				turn: this.getTurn(),
			}),
		);
	}

	sendIndex(index: number): void {
		if (this.opponentPlayer) {
			if (this.game?.setBoard(index, this)) {
				this.changeTurn();
				this.socket.send(
					JSON.stringify({
						index: index,
						sign: this.sign,
						turn: this.getTurn(),
					}),
				);
				this.opponentPlayer.getSocket().send(
					JSON.stringify({
						index: index,
						sign: this.sign,
						turn: this.opponentPlayer.getTurn(),
					}),
				);
				this.game?.checkWin(this);
			}
		}
	}
}
