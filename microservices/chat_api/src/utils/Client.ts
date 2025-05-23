import { onlineClients } from "../webSocketConnection/webSocketConnection";

export class Client {
	private readonly id: string;
	private nickname: string;
	private sockets: WebSocket[] = [];
	constructor(id: string, nickname: string, socket: WebSocket) {
		this.id = id;
		this.nickname = nickname;
		this.sockets.push(socket);
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
	getSockets(): WebSocket[] {
		return this.sockets;
	}
	addSocket(socket: WebSocket): void {
		this.sockets.push(socket);
	}
	removeSocket(socket: WebSocket): void {
		this.sockets = this.sockets.filter((s) => s !== socket);
		if (this.sockets.length === 0) {
			onlineClients.delete(this.id);
		}
	}
	hasActiveSockets(): boolean {
		return this.sockets.length > 0;
	}
	send(message: string): void {
		this.sockets.forEach((socket) => {
			socket.send(message);
		});
	}
}
