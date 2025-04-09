export class Notification {
	private readonly notification: string;
	private readonly pending: boolean;

	constructor(notification: string, pending: boolean) {
		this.notification = notification;
		this.pending = pending;
	}

	getMessage(): string {
		return this.notification;
	}

	getSender(): boolean {
		return this.pending;
	}
}
