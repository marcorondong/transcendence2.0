import { IconComponent } from "./icon-component.js";

class ChatComponent extends HTMLElement {
	// VARIABLES
	ws: WebSocket | undefined = undefined;
	onlineUsers: ChatUser[] = [];
	selectedUser: ChatUser | undefined;

	//ICONS
	plusIcon = new IconComponent("plus", 4);
	minusIcon = new IconComponent("minus", 4);
	usersIcon = new IconComponent("user", 4);

	// BUTTONS
	minMaxButton: HTMLElement = document.createElement("button");

	// ELEMENTS
	nav: HTMLElement = document.createElement("nav");
	main: HTMLElement = document.createElement("div");
	mainMessages: HTMLElement = document.createElement("div");
	mainUsers: HTMLElement = document.createElement("div");
	navUsersContainer: HTMLElement = document.createElement("div");
	navUsersCount: HTMLElement = document.createElement("span");
	chatInput = document.createElement("input");
	sendButton: HTMLElement = document.createElement("button");

	constructor() {
		super();

		// const queryParams = window.location.search;
		this.ws = new WebSocket(
			`wss://${window.location.hostname}:${window.location.port}/ws`,
		);

		this.ws.onmessage = (event) => {
			const chatServiceData: Chat = JSON.parse(event.data);
			if (chatServiceData.type === "message" && this.selectedUser) {
				this.selectedUser.messages.push(chatServiceData.message ?? "");
			}
			if (
				chatServiceData.type === "peopleOnline" &&
				chatServiceData.peopleOnline
			) {
				chatServiceData.peopleOnline.map((person) => {
					if (
						!this.onlineUsers.some((myUser) => myUser.id === person)
					) {
						const newUser: ChatUser = {
							id: person,
							messages: [],
						};
						this.onlineUsers.push(newUser);
						this.updateUsers();
					}
				});
			}
		};
	}

	updateUsers() {
		this.displayOnlineUsers();
		this.navUsersCount.innerText = String(this.onlineUsers.length);
	}

	displayOnlineUsers() {
		this.mainUsers.replaceChildren();
		if (this.onlineUsers.length === 0) {
			this.mainUsers.innerText = "no Users Online";
			return;
		}
		for (const user of this.onlineUsers) {
			const button = document.createElement("button");
			button.classList.add("pong-button-info", "selectUser-group");
			button.id = user.id;
			button.innerText = user.id;
			this.mainUsers.appendChild(button);
		}
	}

	displayCurrentChat() {
		this.mainMessages.replaceChildren();
		if (this.onlineUsers.length === 0) {
			this.mainMessages.innerText = "no Chat History available";
			return;
		}
		if (!this.selectedUser) {
			this.selectedUser = this.onlineUsers[0];
		}

		if (this.selectedUser.messages.length === 0) {
			this.mainMessages.innerText = "no Chat History available";
		}
		console.log("about to display messages", this.selectedUser.messages);

		for (const message of this.selectedUser.messages) {
			const div = document.createElement("div");
			div.innerText = message;
			this.mainUsers.appendChild(div);
		}
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
			this.handleSelectUser(button);
			this.handleMinMaxButton(button);
			this.handleSendButton(button);
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
			this.main.classList.add("grid");
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
			this.main.classList.remove("grid");
		}
	}

	handleSelectUser(button: HTMLButtonElement) {
		if (!button.classList.contains("selectUser-group")) {
			return;
		}
		this.selectedUser = this.onlineUsers.find(
			(user) => user.id === button.textContent,
		);
		console.log("current selected user", this.selectedUser);
		this.displayCurrentChat();
	}

	handleSendButton(button: HTMLButtonElement) {
		if (button.id !== "send-button") {
			return;
		}
		console.log("trying to send message");
		const chat: Chat = {
			type: "message",
			message: this.chatInput.innerText,
			relatedId: this.selectedUser?.id,
		};
		if (this.ws) {
			this.ws.send(JSON.stringify(chat));
		}
	}

	connectedCallback() {
		console.log("Chat CONNECTED");
		document.addEventListener("click", this);
		this.classList.add("flex", "flex-col");
		this.nav.classList.add(
			"flex",
			"w-full",
			"items-center",
			"justify-between",
		);
		this.append(this.nav);

		// MAIN CONTAINER OF CHAT
		this.main.classList.add("hidden");
		this.main.classList.add(
			"grid",
			"gap-4",
			"grid-cols-[1fr_30%]",
			"grid-rows-[1fr_10rem]",
			"h-full",
		);
		this.main.append(this.mainMessages, this.mainUsers);
		this.mainMessages.classList.add("flex", "flex-col", "gap-3", "p-4");
		this.mainUsers.classList.add("flex", "flex-col", "gap-3", "p-4");
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

		this.displayCurrentChat();
		this.displayOnlineUsers();

		this.chatInput.type = "text";
		this.chatInput.placeholder = "start your epic conversation";
		this.sendButton.innerText = "send";
		this.sendButton.classList.add("pong-button");
		this.sendButton.id = "send-button";
		this.main.append(this.chatInput, this.sendButton);
	}

	disconnectedCallback() {
		console.log("Chat DISCONNECTED");
	}
}

customElements.define("chat-component", ChatComponent);

export { ChatComponent };
