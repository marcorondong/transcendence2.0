import { Friend } from "./Friend";
import { Message } from "./Message";
import { Notification } from "./Notification";

export class Client {
	private userName: string;
	private friendList: Set<Friend>;
	private notifications: Set<Notification>;
	private registration: boolean;
	private chatHistory: Map<string, Message[]>;
	private readonly MAX_CHAT_HISTORY: number;
	private socket: WebSocket | null;

	constructor(
		userName: string,
		friendList: Set<Friend> = new Set(),
		notifications: Set<Notification> = new Set(),
		chatHistory: Map<string, Message[]> = new Map(),
		registration: boolean = true,
		maxChatHistory: number = 100,
		socket: WebSocket | null = null,
	) {
		this.userName = userName;
		this.friendList = friendList;
		this.notifications = notifications;
		this.registration = registration;
		this.chatHistory = chatHistory;
		this.MAX_CHAT_HISTORY = maxChatHistory;
		this.socket = socket;
	}

	getUserName(): string {
		return this.userName;
	}

	getFriendList(): Set<Friend> {
		return this.friendList;
	}

	getFriendNames(): string[] {
		return Array.from(this.friendList).map((friend) =>
			friend.getFriendName(),
		);
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

	setUserName(userName: string): void {
		this.userName = userName;
	}

	setFriendList(friendList: Set<Friend>): void {
		this.friendList = friendList;
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

	addToChatHistory(userName: string, message: Message): void {
		const userChatHistory = this.chatHistory.get(userName) ?? [];
		userChatHistory.push(message);
		if (userChatHistory.length > this.MAX_CHAT_HISTORY) {
			userChatHistory.shift(); // Remove the oldest message
		}
		this.chatHistory.set(userName, userChatHistory);
	}

	addToFriendList(friend: Friend): void {
		this.friendList.add(friend);
	}

	addNotification(notification: string, pending: boolean): void {
		this.notifications.add(new Notification(notification, pending));
	}

	updateNotification(notification: string, pending: boolean) {
		for (const notif of this.notifications) {
			if (
				notif.getNotification() === notification &&
				notif.getPending()
			) {
				notif.setPending(pending);
			}
		}
	}

	getChatHistoryForUser(userName: string): Message[] | null {
		return this.chatHistory.get(userName) || null;
	}

	isUserFriend(friendName: string): boolean {
		for (const friend of this.friendList) {
			if (friend.getFriendName() === friendName) {
				return true;
			}
		}
		return false;
	}

	isUserBlocked(friendName: string): boolean {
		for (const friend of this.friendList) {
			if (friend.getFriendName() === friendName) {
				return friend.getBlock();
			}
		}
		return false;
	}

	updateBlockStatus(friendName: string, block: boolean): void {
		for (const friend of this.friendList) {
			if (friend.getFriendName() === friendName) {
				friend.setBlock(block);
			}
		}
	}

	updateClient(friendName: string, notification: string): void {
		this.friendList.add(new Friend(friendName));
		this.chatHistory.set(friendName, []);
		this.notifications.add(new Notification(notification, false));
	}
}
