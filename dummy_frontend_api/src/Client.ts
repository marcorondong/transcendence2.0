

export class Client 
{
	private readonly id: string;
    private nickname: string = '';
    private readonly socket: WebSocket;
	private blockedList: string[] = [];
	private registered: boolean = false;

    constructor(id: string, socket: WebSocket) 
	{
        this.id = id;
		this.socket = socket;
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

	getRegistered(): boolean
	{
		return this.registered;
	}

	setNickname(nickname: string): void
	{
		this.nickname = nickname;
	}

	setBlockedList(blockedList: string[]): void
	{
		this.blockedList = blockedList;
	}

	setRegistered(registered: boolean): void
	{
		this.registered = registered;
	}

	addBlockedUser(nickname: string): void
	{
		this.blockedList.push(nickname);
	}
}