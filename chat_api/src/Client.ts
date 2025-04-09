import { Message } from "./Message";
import { Notification } from "./Notification";

export class Client {
	private userName: string;
	private friendList: Set<string>;
	private blockList: Set<string>;
	private notifications: Set<Notification>;
	private registration: boolean;
	private chatHistory: Map<string, Message[]>;
	private readonly MAX_CHAT_HISTORY: number;
	private socket: WebSocket | null;

	constructor(
		userName: string,
		friendList: Set<string> = new Set(),
		blockList: Set<string> = new Set(),
		notifications: Set<Notification> = new Set(),
		chatHistory: Map<string, Message[]> = new Map(),
		registration: boolean = true,
		maxChatHistory: number = 100,
		socket: WebSocket | null = null,
	) {
		this.userName = userName;
		this.friendList = friendList;
		this.blockList = blockList;
		this.notifications = notifications;
		this.registration = registration;
		this.chatHistory = chatHistory;
		this.MAX_CHAT_HISTORY = maxChatHistory;
		this.socket = socket;
	}

	// Getters
	getUserName(): string {
		return this.userName;
	}
	getBlockList(): string[] {
		return Array.from(this.blockList);
	}
	getFriendList(): string[] {
		return Array.from(this.friendList);
	}
	getRegistration(): boolean {
		return this.registration;
	}
	getChatHistory(): Map<string, Message[]> {
		return this.chatHistory;
	}

	getSocket(): WebSocket | null {
		return this.socket;
	}

	getNotifications(): Notification[] {
		return Array.from(this.notifications);
	}

	// Setters
	setUserName(userName: string): void {
		this.userName = userName;
	}
	setBlockList(blockList: string[]): void {
		this.blockList = new Set(blockList);
	}
	setFriendList(friendList: string[]): void {
		this.friendList = new Set(friendList);
	}
	setRegistration(registration: boolean): void {
		this.registration = registration;
	}
	setChatHistory(chatHistory: Map<string, Message[]>): void {
		this.chatHistory = chatHistory;
	}

	setSocket(socket: WebSocket | null): void {
		this.socket = socket;
	}

	setNotifications(notifications: Notification[]): void {
		this.notifications = new Set(notifications);
	}

	// Method to add a message to the chat history for a specific user
	addToChatHistory(userName: string, message: Message): void {
		const userChatHistory = this.chatHistory.get(userName) ?? [];
		userChatHistory.push(message);
		if (userChatHistory.length > this.MAX_CHAT_HISTORY) {
			userChatHistory.shift(); // Remove the oldest message
		}
		this.chatHistory.set(userName, userChatHistory);
	}

	// Methods to add a user to the block list or friend list
	addToBlockList(userName: string): void {
		this.blockList.add(userName);
	}
	addToFriendList(userName: string): void {
		this.friendList.add(userName);
	}

	addNotification(notification: Notification): void {
		this.notifications.add(notification);
	}

	// Methods to remove a user from the block list or friend list
	removeFromBlockList(userName: string): void {
		this.blockList.delete(userName);
	}
	removeFromFriendList(userName: string): void {
		this.friendList.delete(userName);
	}

	// Method to get chat history for a specific user
	getChatHistoryForUser(userName: string): Message[] {
		return this.chatHistory.get(userName) || [];
	}

	// Methods to check if a user is blocked or a friend, or if the user is registered
	isUserBlocked(userName: string): boolean {
		return this.blockList.has(userName);
	}
	isUserFriend(userName: string): boolean {
		return this.friendList.has(userName);
	}
	isUserRegistered(): boolean {
		return this.registration;
	}
}
