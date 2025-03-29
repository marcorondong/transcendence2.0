
export class Client 
{
	private readonly id: string;
	private nickname: string;
	private readonly socket: WebSocket;
	private blockedList: string[] = [];
	private registration: boolean = false;

	constructor(id: string, socket: WebSocket) 
	{
		this.id = id;
		this.socket = socket;
		this.nickname = '';
	}

	getId(): string
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

	getBlockedList(): string[]
	{
		return this.blockedList;
	}

	getRegistration(): boolean
	{
		return this.registration;
	}

	setNickname(nickname: string): void
	{
		this.nickname = nickname;
	}

	setBlockedList(blockedList: string[]): void
	{
		this.blockedList = blockedList;
	}

	setRegistration(registration: boolean): void
	{
		this.registration = registration;
	}

	addBlockedUser(nickname: string): void
	{
		this.blockedList.push(nickname);
	}
}