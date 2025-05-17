import { IconComponent } from "./icon-component.js";
import { User, Chat, ChatUser, Message } from "../types/Chat.js";
import { fetchChatDb } from "../services/fetch-chat.js";

class ChatComponent extends HTMLElement {
	// VARIABLES
	ws: WebSocket | undefined = undefined;
	onlineUsers: ChatUser[] = [];
	selectedUser: ChatUser | undefined = undefined;
	roomId: string | undefined = undefined;
	me: User | undefined;

	//ICONS
	plusIcon = new IconComponent("plus", 4);
	minusIcon = new IconComponent("minus", 4);
	usersIcon = new IconComponent("user", 4);

	// BUTTONS
	minMaxButton = document.createElement("button");
	sendButton = document.createElement("button");
	blockButton = document.createElement("button");
	inviteButton = document.createElement("button");

	// ELEMENTS
	nav = document.createElement("nav");
	main = document.createElement("div");
	mainMessages = document.createElement("div");
	mainUsers = document.createElement("div");
	navUsersContainer = document.createElement("div");
	navUsersCount = document.createElement("span");
	navMe = document.createElement("div");
	chatInput = document.createElement("textarea");
	chatContainer = document.createElement("div");

	constructor() {
		super();

		// OPEN NEW WEBSOCKET
		this.ws = new WebSocket(
			`wss://${window.location.hostname}:${window.location.port}/chat-api`,
			// `ws://${window.location.hostname}:3002/chat-api`,
		);

		// WEBSOCKET CONNECTION CLOSED
		this.ws.onclose = () => {
			console.log("websocket has closed");
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
			const chatServiceData: Chat = JSON.parse(event.data);
			console.log("websocket data", chatServiceData);

			// RECEIVING MESSAGE
			if (chatServiceData.type === "message") {
				if (
					chatServiceData.sender === undefined ||
					chatServiceData.receiver === undefined
				) {
					return;
				}
				let chatPartner: User;
				if (chatServiceData.sender.id === this.me?.id) {
					chatPartner = chatServiceData.receiver;
				} else {
					chatPartner = chatServiceData.sender;
				}
				const relevantChat = this.onlineUsers.find(
					(user) => user.id === chatPartner.id,
				);
				if (relevantChat) {
					console.log(
						"this message belongs to chat with ",
						relevantChat.id,
					);
					const newMessage: Message = {
						type: chatServiceData.type,
						sender: chatServiceData.sender,
						receiver: chatServiceData.receiver,
						message: chatServiceData.message ?? "",
					};
					this.addTimestamp(newMessage, relevantChat);
					relevantChat.messages.push(newMessage);
					this.displayCurrentChat();
				}
			}
			//
			// A USER LEAVES THE CHAT
			if (chatServiceData.type === "disconnected") {
				if (this.selectedUser?.id === chatServiceData.user?.id) {
					this.selectedUser = undefined;
				}
				const userToRemove = this.onlineUsers.findIndex(
					(u) => u.id === chatServiceData.user?.id,
				);
				if (userToRemove !== undefined) {
					this.onlineUsers.splice(userToRemove, 1);
				}
				this.displayCurrentChat();
				this.updateUsers();
			}

			// // CHAT SERVICE CONFIRMS BLOCKED USER
			// if (chatServiceData.type === "blockResponse") {
			// 	const id = chatServiceData.relatedId;
			// 	const userToBlock = this.onlineUsers.find((u) => u.id === id);
			// 	if (userToBlock) {
			// 		userToBlock.blocked = !userToBlock.blocked;
			// 		this.updateBlockButton(userToBlock);
			// 	}
			// }
			//
			// // INVITATION TO GAME
			// if (chatServiceData.type === "inviteResponse") {
			// 	const id = chatServiceData.relatedId;
			// 	if (!id) {
			// 		return;
			// 	}
			// 	const userToInvite = this.onlineUsers.find((u) => u.id === id);
			// 	if (userToInvite) {
			// 		userToInvite.messages.push({
			// 			id: id,
			// 			content: "Let's play PONG together! ",
			// 			invitation: chatServiceData.roomId,
			// 		});
			// 		this.roomId = chatServiceData.roomId;
			// 		this.displayCurrentChat();
			// 	}
			// }
			// A NEW USER CAME ONLINE
			if (chatServiceData.type === "newUser" && chatServiceData.user) {
				const user: ChatUser = {
					id: chatServiceData.user.id,
					messages: [],
					nickname: chatServiceData.user.nickname,
					blocked: false,
					blockStatusChecked: false,
				};
				this.onlineUsers.push(user);
				this.updateUsers();
			}

			// WHEN USER LOGS IN, SETTING UP PEOPLE THAT ARE ONLINE
			if (
				chatServiceData.type === "onlineUsers" &&
				chatServiceData.users
			) {
				this.me = chatServiceData.me;
				this.navMe.innerText =
					chatServiceData.me?.nickname ?? "unknown";
				chatServiceData.users.map((user) => {
					if (
						!this.onlineUsers.some(
							(onlineUser) => onlineUser.id === user.id,
						)
					) {
						const newUser: ChatUser = {
							id: user.id,
							nickname: user.nickname,
							messages: [],
							blocked: false,
							blockStatusChecked: false,
						};
						this.onlineUsers.push(newUser);
						this.updateUsers();
					}
				});
				console.log("me is", this.me);
				console.log("users is", this.onlineUsers);
			}
		};
	}

	addTimestamp(newMessage: Message, chat: ChatUser) {
		console.log("will add message to:", chat.id);

		if (
			chat.messages.length === 0 ||
			(!chat.messages[chat.messages.length - 1].dateTime &&
				chat.messages[chat.messages.length - 1].sender?.id !==
					newMessage.sender?.id)
		) {
			let sender: string;
			if (newMessage.sender?.id === chat.id) {
				sender = `${newMessage.sender?.nickname} | `;
			} else {
				sender = "You | ";
			}
			const now = new Date();
			sender = sender + now.toLocaleTimeString();
			const timestamp: Message = {
				sender: {
					id: newMessage.sender!.id,
					nickname: newMessage.sender!.nickname,
				},
				message: sender,
				dateTime: now,
			};
			chat.messages.push(timestamp);
		}
	}

	updateBlockButton(user: ChatUser | undefined) {
		if (!user) {
			return;
		}

		if (user.blocked) {
			this.blockButton.classList.add("pong-button-wrong");
		} else {
			this.blockButton.classList.remove("pong-button-wrong");
		}
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
		if (this.selectedUser === undefined && this.onlineUsers.length) {
			this.selectedUser = this.onlineUsers[0];
		}
		for (const user of this.onlineUsers) {
			const userRow = document.createElement("div");
			userRow.classList.add("flex", "gap-1", "items-center");
			this.mainUsers.append(userRow);
			const userButton = document.createElement("button");
			userButton.classList.add(
				"pong-button",
				"pong-button-special",
				"selectUser-group",
				"grow-1",
			);
			userButton.id = user.id;
			userButton.innerText = user.id;
			if (user.id === this.selectedUser?.id) {
				userButton.classList.add(
					"pong-button",
					"pong-button-special-active",
				);
			}
			userRow.append(userButton);
		}
	}

	chatBubble(message: Message) {
		const div = document.createElement("div");
		div.innerText = message.message;
		if (message.invitation) {
			const link = document.createElement("a");
			link.textContent = "click here";
			link.href = `https://${window.location.hostname}:${window.location.port}/pong/${message.invitation}`;
			div.appendChild(link);
		}
		if (message.sender?.id === this.selectedUser?.id) {
			div.classList.add("self-start", "text-left");
			if (!message.dateTime) {
				div.classList.add("dark:bg-slate-500/50");
			}
		} else {
			div.classList.add("self-end", "text-right");
			if (!message.dateTime) {
				div.classList.add("dark:bg-slate-700/50");
			}
		}
		if (message.dateTime) {
			div.classList.add("text-xs", "text-slate-400");
		} else {
			div.classList.add("text-slate-300", "rounded-3xl", "px-4", "py-2");
		}
		return div;
	}

	async setStateChatButtons(size: number) {
		if (!this.selectedUser) {
			return;
		}
		if (this.selectedUser.blockStatusChecked === false) {
			const data = await fetchChatDb(
				this.me?.id,
				this.selectedUser?.id,
				"block-status",
			);
			this.selectedUser.blockStatusChecked = true;
			this.selectedUser.blocked = data.blockStatus;
			console.log("SETTING BLOCKED STATUS");
		}
		if (size === 0) {
			this.chatInput.disabled = true;
			this.sendButton.disabled = true;
			this.blockButton.disabled = true;
			this.inviteButton.disabled = true;
		} else {
			this.chatInput.disabled = false;
			this.sendButton.disabled = false;
			this.blockButton.disabled = false;
			this.inviteButton.disabled = false;
		}
	}

	displayCurrentChat() {
		this.setStateChatButtons(this.onlineUsers.length);
		this.mainMessages.replaceChildren();
		if (this.onlineUsers.length === 0) {
			const chatBubble = this.chatBubble({
				message: "no Chat History available",
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
				message: `no Chat History available with ${this.selectedUser.nickname}`,
			});
			chatBubble.classList.add("text-slate-400");
			this.mainMessages.appendChild(chatBubble);
		}

		// const messagesWithMeta: Message[] = [];
		// const length = this.selectedUser.messages.length;
		// const messages = this.selectedUser.messages;

		// for (let i = 0; i < length; ++i) {
		// 	if (
		// 		i === 0 ||
		// 		(!messages[i - 1].meta && messages[i - 1].id !== messages[i].id)
		// 	) {
		// 		let sender: string;
		// 		if (messages[i].id === this.selectedUser?.id) {
		// 			sender = `${messages[i].id} | `;
		// 		} else {
		// 			sender = "You | ";
		// 		}
		// 		sender = sender + messages[i].dateTime?.toLocaleTimeString();
		// 		const metaMessage: Message = {
		// 			meta: true,
		// 			id: messages[i].id,
		// 			content: sender,
		// 		};
		// 		messagesWithMeta.push(metaMessage);
		// 		messagesWithMeta.push(messages[i]);
		// 	} else {
		// 		messagesWithMeta.push(messages[i]);
		// 	}
		// }

		for (const message of this.selectedUser.messages) {
			const chatBubble = this.chatBubble(message);
			this.mainMessages.appendChild(chatBubble);
		}

		this.updateBlockButton(this.selectedUser);

		this.mainMessages.scrollTop = this.mainMessages.scrollHeight;
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
			this.handleBlockButton(button);
			this.handleInviteButton(button);
		}
	}

	handleMinMaxButton(button: HTMLButtonElement) {
		if (button.id !== "min-max-button") {
			return;
		}
		if (this.minusIcon.classList.contains("hidden")) {
			// CLICKED TO MAXIMIZE
			this.navMe.classList.remove("hidden");
			this.minusIcon.classList.remove("hidden");
			this.minusIcon.classList.add("block");
			this.plusIcon.classList.remove("block");
			this.plusIcon.classList.add("hidden");
			this.classList.add(
				"p-3",
				"h-3/4",
				"aspect-auto",
				"lg:w-auto",
				"lg:aspect-5/4",
				"max-h-200",
				"w-full",
				"grid",
				"grid-cols-[1fr_30%]",
				"grid-rows-[auto_1fr_auto]",
				"gap-3",
			);
			this.classList.remove("h-auto", "w-auto", "p-2");
			this.mainUsers.classList.remove("hidden");
			this.mainMessages.classList.remove("hidden");
			this.chatContainer.classList.remove("hidden");
		} else {
			// CLICKED TO MINIMIZE
			this.navMe.classList.add("hidden");
			this.plusIcon.classList.remove("hidden");
			this.plusIcon.classList.add("block");
			this.minusIcon.classList.remove("block");
			this.minusIcon.classList.add("hidden");
			this.classList.remove(
				"p-3",
				"h-3/4",
				"aspect-auto",
				"lg:w-auto",
				"lg:aspect-5/4",
				"max-h-200",
				"w-full",
				"grid",
				"grid-cols-[1fr_30%]",
				"grid-rows-[auto_1fr_auto]",
				"gap-3",
			);
			this.classList.add("h-auto", "w-auto", "p-2");
			this.chatContainer.classList.add("hidden");
			this.mainUsers.classList.add("hidden");
			this.mainMessages.classList.add("hidden");
		}
	}

	handleSelectUser(button: HTMLButtonElement) {
		if (!button.classList.contains("selectUser-group")) {
			return;
		}
		this.selectedUser = this.onlineUsers.find(
			(user) => user.id === button.textContent,
		);
		this.displayCurrentChat();
		this.displayOnlineUsers();
	}

	handleSendButton(button: HTMLButtonElement) {
		if (button.id !== "send-button") {
			return;
		}
		const chat: Chat = {
			type: "message",
			message: this.chatInput.value,
			id: this.selectedUser?.id,
		};
		if (this.ws) {
			this.ws.send(JSON.stringify(chat));
		}
		this.chatInput.value = "";
	}

	async handleBlockButton(button: HTMLButtonElement) {
		if (button.id !== "block-button") {
			return;
		}
		console.log("trying to block a user");
		const data = await fetchChatDb(
			this.me?.id,
			this.selectedUser?.id,
			"toggle-block",
		);
		if (data.success === true && this.selectedUser) {
			this.selectedUser.blocked = !this.selectedUser.blocked;
			this.updateBlockButton(this.selectedUser);
		}
	}

	handleInviteButton(button: HTMLButtonElement) {
		if (button.id !== "invite-button") {
			return;
		}
		console.log("trying to invite a user");

		const chat: Chat = {
			type: "invite",
			relatedId: this.selectedUser?.id,
		};
		if (this.ws) {
			this.ws.send(JSON.stringify(chat));
		}
		this.dispatchEvent(
			new CustomEvent("pong-link", {
				detail: { source: "pong-view" },
				bubbles: true,
				composed: true,
			}),
		);
	}

	connectedCallback() {
		console.log("Chat CONNECTED");
		document.addEventListener("click", this);
		document.addEventListener("keydown", this);
		this.nav.classList.add(
			"col-span-full",
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
		this.append(this.nav, this.mainMessages, this.mainUsers);

		// MAIN CONTAINER OF CHAT
		this.mainMessages.classList.add(
			"hidden",
			"flex",
			"flex-col",
			"gap-1",
			"p-4",
			"h-full",
			"overflow-y-auto",
			"overflow-x-hidden",
		);
		this.mainUsers.classList.add(
			"hidden",
			"rounded-xl",
			"bg-indigo-950",
			"flex",
			"flex-col",
			"gap-2",
			"p-4",
			"h-full",
			"overflow-y-auto",
			"overflow-x-hidden",
		);

		this.navUsersContainer.appendChild(this.usersIcon);
		this.navUsersContainer.classList.add(
			"whitespace-nowrap",
			"flex",
			"items-center",
		);
		this.navUsersContainer.appendChild(this.navUsersCount);
		this.navUsersCount.innerText = "0";

		this.navMe.classList.add("hidden");

		this.minusIcon.classList.add("hidden");
		this.minMaxButton.classList.add("pong-button", "pong-button-secondary");
		this.minMaxButton.id = "min-max-button";
		this.minMaxButton.append(this.plusIcon, this.minusIcon);
		this.nav.append(this.navUsersContainer, this.navMe, this.minMaxButton);

		this.displayCurrentChat();
		this.displayOnlineUsers();

		this.chatContainer.classList.add(
			"hidden",
			"disabled:bg-indigo-950",
			"rounded-xl",
			"bg-indigo-950",
			"p-3",
			"col-span-full",
			"w-full",
			"h-full",
			"flex",
			"gap-2",
			"items-center",
		);
		this.append(this.chatContainer);
		this.chatInput.placeholder = "enter your message";
		this.chatInput.style.resize = "none";
		this.chatInput.classList.add(
			"grow-1",
			"field-sizing-content",
			"max-h-60",
		);
		const sendIcon = new IconComponent("send", 5);
		this.sendButton.append(sendIcon);
		this.sendButton.classList.add(
			"pong-button",
			"flex",
			"justify-center",
			"items-center",
		);
		this.sendButton.id = "send-button";
		this.blockButton.id = "block-button";
		this.blockButton.classList.add("pong-button");
		const blockIcon = new IconComponent("block", 5);
		this.blockButton.append(blockIcon);
		this.inviteButton.classList.add("pong-button");
		this.inviteButton.id = "invite-button";
		const inviteIcon = new IconComponent("game", 5);
		this.inviteButton.append(inviteIcon);
		const inviteLink = document.createElement("a");
		inviteLink.href = "/pong-view";
		inviteLink.classList.add("pong-link");
		inviteLink.append(this.inviteButton);
		this.chatContainer.append(
			this.chatInput,
			this.sendButton,
			inviteLink,
			this.blockButton,
		);
	}

	disconnectedCallback() {
		console.log("Chat DISCONNECTED");
		this.ws?.close();
	}
}

customElements.define("chat-component", ChatComponent);

export { ChatComponent };
