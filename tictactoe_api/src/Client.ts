import { el } from "@faker-js/faker/.";

export class Client {
	private readonly id: string;
	private readonly socket: WebSocket;
	private friendClient: Client | null = null;
	private sign: string;
	private turn: boolean = false;

	constructor(id: string, socket: WebSocket, sign: string = "") {
		this.id = id;
		this.socket = socket;
		this.sign = sign;
	}

	getId(): string {
		return this.id;
	}

	getSocket(): WebSocket {
		return this.socket;
	}

	getFriendClient(): Client | null {
		return this.friendClient;
	}

	getSign(): string {
		return this.sign;
	}

	getTurn(): boolean {
		return this.turn;
	}

	setFriendClient(friendClient: Client): void {
		this.friendClient = friendClient;
	}

	setSign(sign: string): void {
		this.sign = sign;
		if (sign === "X") {
			this.turn = true;
		} else {
			this.turn = false;
		}
	}

	setTurn(turn: boolean): void {
		this.turn = turn;
	}
}
