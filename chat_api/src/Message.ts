
export class Message 
{
	private readonly text: string;
	private readonly isOwn: boolean;

	constructor(text: string, isOwn: boolean) 
	{
		this.text = text;
		this.isOwn = isOwn;
	}

	getText(): string
	{
		return this.text;
	}

	getIsOwn(): boolean
	{
		return this.isOwn;
	}
}