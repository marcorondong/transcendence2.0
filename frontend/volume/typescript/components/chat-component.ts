import { IconComponent } from "./icon-component.js";

class ChatComponent extends HTMLElement {
	// VARIABLES
	ws: WebSocket | undefined = undefined;
	onlineUsers: ChatUser[] = [];

	//ICONS
	plusIcon = new IconComponent("plus", 4);
	minusIcon = new IconComponent("minus", 4);
	usersIcon = new IconComponent("user", 4);

	// BUTTONS
	minMaxButton: HTMLElement = document.createElement("button");

	// ELEMENTS
	nav: HTMLElement = document.createElement("nav");
	main: HTMLElement = document.createElement("div");
	navUsersContainer: HTMLElement = document.createElement("div");
	navUsersCount: HTMLElement = document.createElement("span");

	constructor() {
		super();

		// const queryParams = window.location.search;
		this.ws = new WebSocket(
			`wss://${window.location.hostname}:${window.location.port}/ws`,
		);

		this.ws.onmessage = (event) => {
			const test: Chat = JSON.parse(event.data);
			if (test.type === "peopleOnline" && test.peopleOnline) {
				test.peopleOnline.map((person) => {
					if (
						!this.onlineUsers.some((myUser) => myUser.id === person)
					) {
						const newUser: ChatUser = {
							id: person,
							messages: [],
						};
						this.onlineUsers.push(newUser);
						this.navUsersCount.innerText = String(
							this.onlineUsers.length,
						);
					}
				});
				console.log("ChatUsers that are online:", this.onlineUsers);
			}
		};
	}

	handleEvent(event: Event) {
		const handlerName =
			"on" + event.type.charAt(0).toUpperCase() + event.type.slice(1);
		const handler = this[handlerName as keyof this];
		if (typeof handler === "function") {
			handler.call(this, event);
		}
	}

	onClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target) {
			return;
		}

		// HANDLE ALL BUTTONS
		const button = target.closest("button");
		if (button) {
			this.handleMinMaxButton(button);
		}
	}

	handleMinMaxButton(button: HTMLButtonElement) {
		if (button.id !== "min-max-button") {
			return;
		}
		if (this.minusIcon.classList.contains("hidden")) {
			// CLICKED TO MAXIMIZE
			this.minusIcon.classList.remove("hidden");
			this.minusIcon.classList.add("block");
			this.plusIcon.classList.remove("block");
			this.plusIcon.classList.add("hidden");
			this.classList.add("h-3/4", "w-full", "sm:w-3/4");
			this.classList.remove("h-auto", "w-auto");
			this.main.classList.add("block");
			this.main.classList.remove("hidden");
		} else {
			// CLICKED TO MINIMIZE
			this.plusIcon.classList.remove("hidden");
			this.plusIcon.classList.add("block");
			this.minusIcon.classList.remove("block");
			this.minusIcon.classList.add("hidden");
			this.classList.remove("h-3/4", "w-full", "sm:w-3/4");
			this.classList.add("h-auto", "w-auto");
			this.main.classList.add("hidden");
			this.main.classList.remove("block");
		}
	}

	async connectedCallback() {
		console.log("Chat CONNECTED");
		document.addEventListener("click", this);
		this.nav.classList.add("flex", "w-full", "items-center");
		this.append(this.nav);

		this.main.classList.add("hidden");
		this.main.innerText = "hi ther this is chat";
		this.appendChild(this.main);

		this.navUsersContainer.appendChild(this.usersIcon);
		this.navUsersContainer.classList.add(
			"whitespace-nowrap",
			"flex",
			"items-center",
		);
		this.navUsersContainer.appendChild(this.navUsersCount);
		this.navUsersCount.innerText = "0";
		this.nav.appendChild(this.navUsersContainer);

		this.minusIcon.classList.add("hidden");
		this.minMaxButton.classList.add("pong-button");
		this.minMaxButton.id = "min-max-button";
		this.minMaxButton.append(this.plusIcon, this.minusIcon);
		this.nav.append(this.minMaxButton);
	}

	disconnectedCallback() {
		console.log("Chat DISCONNECTED");
	}
}

customElements.define("chat-component", ChatComponent);

export { ChatComponent };
