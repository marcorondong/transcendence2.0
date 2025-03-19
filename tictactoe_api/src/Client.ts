
export class Client 
{
	private readonly id: string;
	private nickname: string = '';
	private readonly socket: WebSocket;
	private friendSocket: WebSocket | null = null;
	private registered: boolean = false;

	constructor(id: string, socket: WebSocket) 
	{
		this.id = id;
		this.socket = socket;
	}

	getID(): string
	{
		return this.id;
	}

	getNickname(): string
	{
		return this.nickname;
	}

	getSocket(): WebSocket
	{
		return this.socket;
	}

	getFriendSocket(): WebSocket | null
	{
		return this.friendSocket;
	}

	getRegistered(): boolean
	{
		return this.registered;
	}

	setNickname(nickname: string): void
	{
		this.nickname = nickname;
	}

	setFriendSocket(friendSocket: WebSocket): void
	{
		this.friendSocket = friendSocket;
	}

	setRegistered(registered: boolean): void
	{
		this.registered = registered;
	}
}