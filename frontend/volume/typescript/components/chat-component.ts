import { IconComponent } from "./icon-component.js";
import { Chat, ChatUser, Message } from "../types/Chat.js";

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
	minMaxButton = document.createElement("button");

	// ELEMENTS
	nav = document.createElement("nav");
	main = document.createElement("div");
	mainMessages = document.createElement("div");
	mainUsers = document.createElement("div");
	navUsersContainer = document.createElement("div");
	navUsersCount = document.createElement("span");
	chatInput = document.createElement("textarea");
	sendButton = document.createElement("button");
	chatContainer = document.createElement("div");

	constructor() {
		super();

		// const queryParams = window.location.search;
		this.ws = new WebSocket(
			`wss://${window.location.hostname}:${window.location.port}/ws`,
		);

		// WEBSOCKET CONNECTION CLOSED
		this.ws.onclose = () => {
			console.log("websocket has close");
			this.onlineUsers = [];
			this.selectedUser = undefined;
			if (this.plusIcon.classList.contains("hidden")) {
				this.handleMinMaxButton(this.minMaxButton);
			}
			this.mainMessages.replaceChildren();
			this.classList.add("text-slate-500");
			this.innerText = "offline";
		};

		this.ws.onmessage = (event) => {
			console.log("websocket event");
			const chatServiceData: Chat = JSON.parse(event.data);
			console.log("websocket data", chatServiceData);

			// CHAT SERVICE RETURNS USERS OWN MESSAGE
			if (chatServiceData.type === "messageResponse") {
				this.selectedUser?.messages.push({
					id: chatServiceData.relatedId || "",
					content: chatServiceData.message ?? "",
				});
				this.displayCurrentChat();
			}

			// ANOTHER USER LEAVES THE CHAT
			if (chatServiceData.type === "disconnected") {
				console.log("somebody left the chat");
				if (this.selectedUser?.id === chatServiceData.relatedId) {
					this.selectedUser = undefined;
				}
				const userToRemove = this.onlineUsers.findIndex(
					(u) => u.id === chatServiceData.relatedId,
				);
				console.log("index of user to remove", userToRemove);
				if (userToRemove !== undefined) {
					this.onlineUsers.splice(userToRemove, 1);
				}
				this.displayCurrentChat();
				this.updateUsers();
			}

			// RECEIVING MESSAGE
			if (
				chatServiceData.messageResponse &&
				chatServiceData.messageResponse.type === "messageResponse"
			) {
				console.log(" in handle recieving message");
				const sender = this.onlineUsers.find(
					(user) =>
						user.id === chatServiceData.messageResponse?.relatedId,
				);
				if (sender) {
					sender.messages.push({
						id: sender.id,
						content: chatServiceData.messageResponse.message ?? "",
					});
				}
				this.displayCurrentChat();
				console.log("updated online users object", this.onlineUsers);
			}

			// A NEW USER CAME ONLINE
			if (chatServiceData.type === "newClient") {
				const user: ChatUser = {
					id: chatServiceData.relatedId ?? "",
					messages: [],
					blocked: false,
				};
				this.onlineUsers.push(user);
				this.updateUsers();
			}

			// WHEN USER LOGS IN, SETTING UP PEOPLE THAT ARE ONLINE
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
							blocked: false,
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
		if (this.onlineUsers.length === 1) {
			this.displayCurrentChat();
		}
	}

	displayOnlineUsers() {
		this.mainUsers.replaceChildren();
		if (this.onlineUsers.length === 0) {
			this.mainUsers.innerText = "no Users Online";
			return;
		}
		for (const user of this.onlineUsers) {
			const userRow = document.createElement("div");
			userRow.classList.add("flex", "gap-2", "items-center");
			this.mainUsers.append(userRow);
			const userButton = document.createElement("button");
			userButton.classList.add(
				"pong-button-info",
				"selectUser-group",
				"grow-1",
			);
			userButton.id = user.id;
			userButton.innerText = user.id;
			userRow.append(userButton);

			if (user.id === this.selectedUser?.id) {
				const blockButton = document.createElement("button");
				blockButton.classList.add("pong-button-info");
				const blockIcon = new IconComponent("block", 6);
				blockButton.append(blockIcon);
				const inviteButton = document.createElement("button");
				inviteButton.classList.add("pong-button-info");
				const inviteIcon = new IconComponent("game", 6);
				inviteButton.append(inviteIcon);
				userRow.append(blockButton, inviteButton);
			}
		}
	}

	chatBubble(message: Message) {
		const div = document.createElement("div");
		div.innerText = message.content;
		if (message.id === this.selectedUser?.id) {
			div.classList.add(
				"self-start",
				"text-left",
				"dark:bg-slate-500/50",
			);
		} else {
			div.classList.add("self-end", "text-right", "dark:bg-slate-700/50");
		}
		div.classList.add("text-slate-300", "rounded-3xl", "px-4", "py-2");
		return div;
	}

	displayCurrentChat() {
		if (this.onlineUsers.length === 0) {
			this.chatInput.disabled = true;
			this.sendButton.disabled = true;
		} else {
			this.chatInput.disabled = false;
			this.sendButton.disabled = false;
		}
		this.mainMessages.replaceChildren();
		if (this.onlineUsers.length === 0) {
			const chatBubble = this.chatBubble({
				id: this.selectedUser?.id || "",
				content: "no Chat History available",
			});
			chatBubble.classList.add("text-slate-400");
			this.mainMessages.appendChild(chatBubble);
			return;
		}
		if (!this.selectedUser) {
			this.selectedUser = this.onlineUsers[0];
		}

		if (this.selectedUser.messages.length === 0) {
			const chatBubble = this.chatBubble({
				id: this.selectedUser.id || "",
				content: `no Chat History available with ${this.selectedUser.id}`,
			});
			chatBubble.classList.add("text-slate-400");
			this.mainMessages.appendChild(chatBubble);
		}
		console.log("about to display messages", this.selectedUser.messages);

		for (const message of this.selectedUser.messages) {
			const chatBubble = this.chatBubble(message);
			this.mainMessages.appendChild(chatBubble);
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
	onKeydown(event: KeyboardEvent) {
		if (
			event.key === "Enter" &&
			document.activeElement === this.chatInput
		) {
			event.preventDefault();
			this.sendButton.click();
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
		this.displayOnlineUsers();
	}

	handleSendButton(button: HTMLButtonElement) {
		if (button.id !== "send-button") {
			return;
		}
		console.log("trying to send message");
		const chat: Chat = {
			type: "message",
			message: this.chatInput.value,
			relatedId: this.selectedUser?.id,
		};
		if (this.ws) {
			this.ws.send(JSON.stringify(chat));
		}
		this.chatInput.value = "";
	}

	handleBlockButton(button: HTMLButtonElement) {
		if (button.id !== "block-button") {
			return;
		}
		console.log("trying to block a user");
		const chat: Chat = {
			type: "block",
			relatedId: this.selectedUser?.id,
		};
		if (this.ws) {
			this.ws.send(JSON.stringify(chat));
		}
		this.chatInput.value = "";
	}

	connectedCallback() {
		console.log("Chat CONNECTED");
		document.addEventListener("click", this);
		document.addEventListener("keydown", this);
		this.classList.add("flex", "flex-col");
		this.nav.classList.add(
			"flex",
			"gap-4",
			"w-full",
			"items-center",
			"justify-between",
			"bg-indigo-800",
			"rounded-3xl",
			"px-4",
			"py-2",
			"border-cyan-500",
		);
		this.append(this.nav);

		// MAIN CONTAINER OF CHAT
		this.main.classList.add(
			"hidden",
			"grid",
			"gap-4",
			"grid-cols-[1fr_30%]",
			"grid-rows-[1fr_auto]",
			"h-full",
			"my-4",
		);
		this.main.append(this.mainMessages, this.mainUsers);
		this.mainMessages.classList.add(
			"flex",
			"flex-col",
			"gap-1",
			"p-4",
			"h-full",
			"overflow-y-auto",
			"overflow-x-hidden",
		);
		this.mainUsers.classList.add(
			"rounded-xl",
			"bg-indigo-950",
			// "border-indigo-900",
			// "border-s-2",
			"flex",
			"flex-col",
			"gap-2",
			"p-4",
			"h-full",
			"overflow-y-auto",
			"overflow-x-hidden",
		);
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
		this.minMaxButton.classList.add("pong-button-secondary");
		this.minMaxButton.id = "min-max-button";
		this.minMaxButton.append(this.plusIcon, this.minusIcon);
		this.nav.append(this.minMaxButton);

		this.displayCurrentChat();
		this.displayOnlineUsers();

		this.chatContainer.classList.add(
			"disabled:bg-indigo-950",
			"rounded-xl",
			"bg-indigo-950",
			"px-8",
			"py-4",
			"col-span-full",
			"w-full",
			"h-full",
			"flex",
			"gap-4",
			"items-end",
		);
		this.main.append(this.chatContainer);
		this.chatInput.placeholder = "enter your message";
		this.chatInput.style.resize = "none";
		this.chatInput.classList.add(
			"grow-1",
			"field-sizing-content",
			"max-h-60",
		);
		const sendIcon = new IconComponent("send", 4);
		this.sendButton.append(sendIcon);
		this.sendButton.classList.add(
			"pong-button",
			"flex",
			"justify-center",
			"items-center",
		);
		this.sendButton.id = "send-button";
		this.chatContainer.append(this.chatInput, this.sendButton);
	}

	disconnectedCallback() {
		console.log("Chat DISCONNECTED");
	}
}

customElements.define("chat-component", ChatComponent);

export { ChatComponent };
