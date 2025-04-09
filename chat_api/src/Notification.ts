export class Notification {
	private notification: string;
	private pending: boolean;

	constructor(notification: string, pending: boolean) {
		this.notification = notification;
		this.pending = pending;
	}

	getNotification(): string {
		return this.notification;
	}

	getPending(): boolean {
		return this.pending;
	}

	setNotification(notification: string): void {
		this.notification = notification;
	}

	setPending(pending: boolean): void {
		this.pending = pending;
	}
}
