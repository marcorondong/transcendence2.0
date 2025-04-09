export class Message {
	private readonly message: string;
	private readonly sender: string;

	constructor(message: string, sender: string) {
		this.message = message;
		this.sender = sender;
	}

	getMessage(): string {
		return this.message;
	}

	getSender(): string {
		return this.sender;
	}
}
