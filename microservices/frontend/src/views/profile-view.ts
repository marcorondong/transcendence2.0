import { ChatComponent } from "../components/chat-component";
import type { MatchHistory, User } from "../types/User";
import { FetchUsers } from "../services/fetch-users";
import { FetchPongDb } from "../services/fetch-pong-db";
import { ProfileDetailComponent } from "../components/profile-detail-component";
import { ProfileMatchHistoryComponent } from "../components/profile-match-history-component";
import { HeadlineComponent } from "../components/shared/headline-component";
import { ProfileFriendsComponent } from "../components/profile-friends-component";
import { FetchAuth } from "../services/fetch-auth";
import type { FriendRequestPending, Me } from "../types/Fetch";
import { errorLinkEvent, notificationEvent } from "../services/events";
import { ProfileFriendsOutComponent } from "../components/profile-friends-out-component";
import { ProfileFriendsInComponent } from "../components/profile-friends-in-component";

export class ProfileView extends HTMLElement {
	chat: ChatComponent;
	userData: User | null = null;
	paramsId: string | null = null;
	matchHistory: MatchHistory[] | null = null;
	friendRequestsOut: FriendRequestPending[] | null = null;
	friendRequestsIn: FriendRequestPending[] | null = null;
	friends: User[] | null = null;
	userId: string | undefined;
	meId: string | undefined;
	friendsOutContainer = document.createElement("div");
	friendsInContainer = document.createElement("div");
	friendsContainer = document.createElement("div");

	constructor(chat: ChatComponent) {
		super();
		this.chat = chat;
	}

	async connectedCallback() {
		console.log("PROFILE VIEW has been CONNECTED");

		this.userIdFromQueryParam();
		await this.fetchData();
		if (!this.userData) {
			document.dispatchEvent(errorLinkEvent);
		}
		this.addEventListener("click", this);
		this.buildDomElements();
	}

	disconnectedCallback() {
		this.removeEventListener("click", this);
		console.log("PROFILE VIEW has been DISCONNECTED");
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

		const button = target.closest("button");
		if (button) {
			this.handleDeleteOutButton(button);
			this.handleDeleteFriendButton(button);
			this.handleAcceptInButton(button);
			this.handleDeleteInButton(button);
		}
	}

	async handleDeleteOutButton(button: HTMLButtonElement) {
		if (!button.id.includes("delete-out-button")) {
			return;
		}

		let id = button.id;
		id = id.replace(/^delete-out-button-/, "");
		try {
			// DELETING FRIEND REQUEST
			FetchUsers.friendRequestDelete(id);

			const friendContainer = document.getElementById(
				"containerFriendOut-" + id,
			);
			if (friendContainer) {
				friendContainer.remove();
			}
			document.dispatchEvent(
				notificationEvent(
					"Friend request smashed to pieces! ... who needs friends anyway ...",
					"success",
				),
			);
			const friendsComponent = document.getElementsByTagName(
				"profile-friends-out-component",
			);
			if (friendsComponent?.[0].children.length === 0) {
				this.friendsOutContainer.remove();
			}
		} catch (e) {
			document.dispatchEvent(
				notificationEvent(
					"failed to delete friend request ... maybe this is fate?",
					"error",
				),
			);
			console.error(e);
		}
	}

	async handleAcceptInButton(button: HTMLButtonElement) {
		if (!button.id.includes("accept-in-button")) {
			return;
		}

		let id = button.id;
		id = id.replace(/^accept-in-button-/, "");
		try {
			// ACCEPTING FRIEND REQUEST
			await FetchUsers.friendRequestAccept(id);
			const iconComponent = button.firstElementChild;
			if (this.chat?.ws && iconComponent?.id) {
				this.chat.ws.send(
					JSON.stringify({
						type: "refreshFriendList",
						id: iconComponent.id,
					}),
				);
			}
			const friendContainer = document.getElementById(
				"containerFriendIn-" + id,
			);
			if (friendContainer) {
				friendContainer.remove();
			}
			document.dispatchEvent(
				notificationEvent(
					"This is the beginning of a beautiful friendship",
					"success",
				),
			);
			const friendsComponent = document.getElementsByTagName(
				"profile-friends-in-component",
			);
			if (friendsComponent?.[0].children.length === 0) {
				this.friendsInContainer.remove();
			}

			if (this.userId) {
				this.friends = await FetchUsers.friendsGet(this.userId);
				this.buildFriends();
			}
		} catch (e) {
			document.dispatchEvent(
				notificationEvent(
					"failed to delete friend request ... maybe this is fate?",
					"error",
				),
			);
			console.error(e);
		}
	}

	async handleDeleteInButton(button: HTMLButtonElement) {
		if (!button.id.includes("delete-in-button")) {
			return;
		}

		let id = button.id;
		id = id.replace(/^delete-in-button-/, "");
		try {
			// DELETING FRIEND REQUEST
			FetchUsers.friendRequestDelete(id);

			const friendContainer = document.getElementById(
				"containerFriendIn-" + id,
			);
			if (friendContainer) {
				friendContainer.remove();
			}
			document.dispatchEvent(
				notificationEvent("I hate friends!", "success"),
			);
			const friendsComponent = document.getElementsByTagName(
				"profile-friends-in-component",
			);
			if (friendsComponent?.[0].children.length === 0) {
				this.friendsInContainer.remove();
			}
		} catch (e) {
			document.dispatchEvent(
				notificationEvent(
					"failed to delete friend request ... maybe this is fate?",
					"error",
				),
			);
			console.error(e);
		}
	}

	async handleDeleteFriendButton(button: HTMLButtonElement) {
		if (!button.id.includes("delete-friend-button") || !this.userId) {
			return;
		}

		let id = button.id;
		id = id.replace(/^delete-friend-button-/, "");
		try {
			// DELETING FRIEND
			FetchUsers.friendsDelete(this.userId, id);
			if (this.chat?.ws) {
				this.chat.ws.send(
					JSON.stringify({ type: "refreshFriendList", id: id }),
				);
			}

			const friendContainer = document.getElementById(
				"containerFriend-" + id,
			);
			if (friendContainer) {
				friendContainer.remove();
			}
			document.dispatchEvent(
				notificationEvent(
					"Friendship smashed to pieces! ... who needs friends anyway ...",
					"success",
				),
			);
			const friendsComponent = document.getElementsByTagName(
				"profile-friends-component",
			);
			if (friendsComponent?.[0].children.length === 0) {
				this.friendsContainer.remove();
			}
		} catch (e) {
			document.dispatchEvent(
				notificationEvent(
					"failed to delete friend ... maybe this is fate?",
					"error",
				),
			);
			console.error(e);
		}
	}

	userIdFromQueryParam() {
		const paramsString = window.location.search;
		const searchParams = new URLSearchParams(paramsString);
		this.paramsId = searchParams.get("userId");
	}

	async fetchData() {
		try {
			const meData: Me = await FetchAuth.verifyConnection();
			this.meId = meData.id;
			this.userId = this.paramsId ?? this.meId;
			if (this.userId === this.meId) {
				this.friendRequestsOut =
					await FetchUsers.friendRequestGetFromMe(meData.id);
				this.friendRequestsIn = await FetchUsers.friendRequestGetToMe(
					meData.id,
				);
				this.friends = await FetchUsers.friendsGet(this.userId);
			}
			this.userData = await FetchUsers.user(this.userId);
			this.matchHistory = await FetchPongDb.matchHistory(this.userId);
			// add fetch for friends list here
		} catch (e) {
			console.error(e);
		}
	}

	buildFriends() {
		if (this.friends?.length) {
			this.friendsContainer.append(
				new HeadlineComponent("Friends"),
				new ProfileFriendsComponent(
					this.friends,
					this.userId === this.meId,
				),
			);
			this.insertBefore(this.friendsContainer, this.children[1] || null);
		}
	}

	buildDomElements() {
		const editableProfile = this.userId === this.meId;
		this.classList.add("flex", "flex-col", "gap-18");
		if (this.userData) {
			const container = document.createElement("div");
			container.append(
				new HeadlineComponent("Profile"),
				new ProfileDetailComponent(
					this.userData,
					this.userId === this.meId,
				),
			);
			this.append(container);
		}
		this.buildFriends();

		if (this.friendRequestsIn?.length && editableProfile) {
			this.friendsInContainer.append(
				new HeadlineComponent("Incoming Friend Requests"),
				new ProfileFriendsInComponent(this.friendRequestsIn),
			);
			this.append(this.friendsInContainer);
		}

		if (this.friendRequestsOut?.length && this.userId && editableProfile) {
			this.friendsOutContainer.id = "friendRequestOutContainer";
			this.friendsOutContainer.append(
				new HeadlineComponent("Outgoing Friend Requests"),
				new ProfileFriendsOutComponent(this.friendRequestsOut),
			);
			this.append(this.friendsOutContainer);
		}

		if (this.matchHistory && this.userData) {
			const container = document.createElement("div");
			container.classList.add("flex", "flex-col", "gap-4");
			const headlineText =
				this.userId === this.meId
					? "My 1v1 Match History"
					: "1v1 Match History of " + this.userData.nickname;
			container.append(new HeadlineComponent(headlineText));
			for (let match of this.matchHistory) {
				const matchCard = new ProfileMatchHistoryComponent(
					match,
					this.userData,
				);
				container.append(matchCard);
			}
			this.append(container);
		}
	}
}

customElements.define("profile-view", ProfileView);

export function createComponent(chat: ChatComponent) {
	return new ProfileView(chat);
}
