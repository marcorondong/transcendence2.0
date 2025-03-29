
export class Client 
{
	private readonly id: string;
	private nickname: string;
	private readonly socket: WebSocket;
	private friendSocket: WebSocket | null = null;
	private registration: boolean = false;

	constructor(id: string, socket: WebSocket) 
	{
		this.id = id;
		this.socket = socket;
		this.nickname = '';
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

	getRegistration(): boolean
	{
		return this.registration;
	}

	setNickname(nickname: string): void
	{
		this.nickname = nickname;
	}

	setFriendSocket(friendSocket: WebSocket): void
	{
		this.friendSocket = friendSocket;
	}

	setRegistration(registered: boolean): void
	{
		this.registration = registered;
	}
}