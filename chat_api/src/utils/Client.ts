export class Client {
	private readonly id: string;
	private nickname: string;
	private readonly socket: WebSocket;
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
	getSocket(): WebSocket {
		return this.socket;
	}
}
