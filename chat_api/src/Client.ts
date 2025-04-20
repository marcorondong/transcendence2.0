
export class Client
{
	private readonly id: string;
	private readonly socket: WebSocket;
	private blockList: Set<string>;

	constructor(id: string, socket: WebSocket, blockList: Set<string>)
	{
		this.id = id;
		this.socket = socket;
		this.blockList = blockList;
	}

	getId(): string
	{
		return this.id;
	}
	getSocket(): WebSocket
	{
		return this.socket;
	}
	getBlockList(): Set<string>
	{
		return this.blockList;
	}
	
	addBlockedUser(id: string): void
	{
		this.blockList.add(id);
	}
	removeBlockedUser(id: string): void
	{
		this.blockList.delete(id);
	}
	isBlocked(id: string): boolean
	{
		return this.blockList.has(id);
	}
}