export class Client {
	private readonly userId: string;
	private readonly socket: WebSocket;
	private blockList: Set<string>;
	constructor(userId: string, socket: WebSocket, blockList: Set<string>) {
		this.userId = userId;
		this.socket = socket;
		this.blockList = blockList;
	}
	getId(): string {
		return this.userId;
	}
	getSocket(): WebSocket {
		return this.socket;
	}
	getBlockList(): Set<string> {
		return this.blockList;
	}
	addBlockedUser(userId: string): void {
		this.blockList.add(userId);
	}
	removeBlockedUser(userId: string): void {
		this.blockList.delete(userId);
	}
	isBlocked(userId: string): boolean {
		return this.blockList.has(userId);
	}
}
