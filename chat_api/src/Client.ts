
export class Client 
{
	private readonly id: string;
<<<<<<< HEAD
    private nickname: string = '';
=======
    private nickname: string;
>>>>>>> origin/main
    private readonly socket: WebSocket;
	private blockedList: string[] = [];
	private registered: boolean = false;

<<<<<<< HEAD
    constructor(id: string, socket: WebSocket) 
	{
        this.id = id;
		this.socket = socket;
=======
    constructor(id: string, nickname: string, socket: WebSocket) 
	{
        this.id = id;
		this.socket = socket;
        this.nickname = '';
>>>>>>> origin/main
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