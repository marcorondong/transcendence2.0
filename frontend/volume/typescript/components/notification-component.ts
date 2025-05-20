type State = "success" | "error" | "info";

class NotificationComponent extends HTMLElement {
	message: string;
	state: State;
	notificationContainer: HTMLElement | null;
	notification: HTMLElement | null;
	constructor(msg: string, state: State) {
		super();
		this.message = msg;
		this.state = state;
		console.log("NOTIFICATION has been CONNECTED");
		this.notificationContainer = document.getElementById(
			"notification-container",
		);
		if (!this.notificationContainer) {
			console.log('creating new DIIIIIIIIV');
			this.notificationContainer = document.createElement("div");
		}
		this.notificationContainer.classList.add("fixed", "top-10", "right-10");
		this.notificationContainer.id = "notification-container";
		this.notification = document.createElement("div");
		this.notification.innerText = this.message;
		const container = document.getElementById("container");
		if (container && this.notificationContainer) {
			container.append(this.notificationContainer);
		}
		this.notification.classList.add("pong-notification");
		switch (this.state) {
			case "info":
				this.notification.classList.add("pong-notification-info");
				break;
			case "error":
				console.log("case error");
				this.notification.classList.add("pong-notification-error");
				break;
			case "success":
				this.notification.classList.add("pong-notification-success");
				break;
		}
		this.notificationContainer.appendChild(this.notification);
		setTimeout(() => {
			this.notification?.remove();
		}, 4000);
	}

	connectedCallback() {}

	disconnectedCallback() {
		console.log("NOTIFICATION has been DISCONNECTED");
		if (
			this.notificationContainer &&
			this.notificationContainer.children.length < 2
		) {
			this.notificationContainer.remove();
		} else {
			this.notification?.remove();
		}
	}
}

customElements.define("notification-component", NotificationComponent);

export { NotificationComponent };
