import { ChatComponent } from "../components/chat-component";
import type { User, UserAggregated } from "../types/User";
import type {
	FetchConfig,
	FriendRequest,
	FriendRequestPending,
	Me,
} from "../types/Fetch";
import { FetchPongDb } from "../services/fetch-pong-db";
import { UsersUserComponent } from "../components/users-user-component";
import { UsersPaginationComponent } from "../components/users-pagination-component";
import {
	errorLinkEvent,
	notificationEvent,
	profileLinkEvent,
} from "../services/events";
import { baseUrl, fetchPong } from "../services/fetch";
import { FetchUsers } from "../services/fetch-users";
import { FetchAuth } from "../services/fetch-auth";

export class UsersView extends HTMLElement {
	chat: ChatComponent;
	usersAggregated: UserAggregated[] = [];
	usersData: User[] = [];
	page: number = 1;
	meData: Me | null = null;
	constructor(chat: ChatComponent) {
		super();
		this.chat = chat;
	}

	async connectedCallback() {
		console.log("USERS VIEW has been connected");
		await this.fetchData();
		this.buildDomElements();

		this.addEventListeners();
		this.applyOnlineStatus();
	}

	disconnectedCallback() {
		console.log("USERS VIEW has been DISCONNECTED");
		document.removeEventListener("onlineuser", this);
		this.removeEventListener("click", this);
	}

	addEventListeners() {
		document.addEventListener("onlineuser", this);
		this.addEventListener("click", this);
	}

	handleEvent(event: Event) {
		const handlerName =
			"on" + event.type.charAt(0).toUpperCase() + event.type.slice(1);
		const handler = this[handlerName as keyof this];
		if (typeof handler === "function") {
			handler.call(this, event);
		}
	}

	onOnlineuser() {
		this.applyOnlineStatus();
	}

	onClick(event: MouseEvent) {
		event.preventDefault();
		const target = event.target as HTMLElement;
		if (!target) {
			return;
		}

		this.handleUserLink(target);

		// HANDLE ALL BUTTONS
		const button = target.closest("button");
		if (button) {
			this.handleFriend(button);
			this.handleButtonLeft(button);
			this.handleButtonRight(button);
		}
	}

	handleUserLink(target: HTMLElement) {
		if (!target.classList.contains("user-link")) {
			return;
		}

		const anchor = target.closest("a") as HTMLAnchorElement | null;
		if (anchor) {
			this.dispatchEvent(profileLinkEvent(anchor.id));
		}
	}

	async handleFriend(button: HTMLButtonElement) {
		if (!button.classList.contains("button-friend")) {
			return;
		}
		let toId = button.id;
		toId = toId.replace(/^friend-/, "");
		const data: FriendRequest = {
			fromId: this.meData?.id ?? "",
			toId,
			message: "hello",
		};

		try {
			await FetchUsers.friendRequestPost(data);
			button.disabled = true;
			document.dispatchEvent(
				notificationEvent("Sent Friend Request", "success"),
			);
		} catch (e) {
			document.dispatchEvent(
				notificationEvent("failed to send Friend Request", "error"),
			);
			console.error(e);
		}
	}

	async handleButtonLeft(button: HTMLButtonElement) {
		if (button.id !== "button-left") {
			return;
		}
		this.page -= 1;
		const urlBrowser = baseUrl + "/users-view?page=" + this.page;
		window.history.pushState({ path: urlBrowser }, "", urlBrowser);
		this.replaceChildren();
		await this.fetchData();
		this.buildDomElements();
		this.applyOnlineStatus();
	}

	async handleButtonRight(button: HTMLButtonElement) {
		if (button.id !== "button-right") {
			return;
		}
		this.page += 1;
		const urlBrowser = baseUrl + "/users-view?page=" + this.page;
		window.history.pushState({ path: urlBrowser }, "", urlBrowser);
		this.replaceChildren();
		await this.fetchData();
		this.buildDomElements();
		this.applyOnlineStatus();
	}

	async fetchUsers(page: number) {
		const urlApi = `/api/users/?page=${page}`;
		const usersConfig: FetchConfig<User> = {
			url: urlApi,
			headers: { accept: "application/json" },
			method: "GET",
			// validator: validateUser,
		};
		// TODO: replace this as with valibot parse
		return (await fetchPong<User>(usersConfig)) as User[];
	}

	async checkNextPage() {
		try {
			const user = (await this.fetchUsers(this.page + 1)) as User[];
			return !!user.length;
		} catch (e) {
			return false;
		}
	}

	handleQueryParam() {
		const paramsString = window.location.search;
		const searchParams = new URLSearchParams(paramsString);
		const pageFromQuery = Number(searchParams.get("page"));
		if (pageFromQuery && pageFromQuery > 0 && pageFromQuery < 1000) {
			this.page = pageFromQuery;
		}
		// const urlBrowser = baseUrl + "/users-view?page=" + this.page;
		const urlBrowser = "/users-view?page=" + this.page;
		window.history.pushState({ path: urlBrowser }, "", urlBrowser);
	}

	async fetchData() {
		this.handleQueryParam();
		try {
			this.meData = await FetchAuth.verifyConnection();
			if (!this.meData) {
				return;
			}
			this.usersData = await this.fetchUsers(this.page);
			const userIds = this.usersData.map((u) => u.id);
			const statsData = await FetchPongDb.stats(userIds);
			const friends: User[] = await FetchUsers.friendsGet(this.meData.id);
			const friendRequests: FriendRequestPending[] =
				await FetchUsers.friendRequestGetFromMe(this.meData.id);
			this.usersAggregated = this.usersData.map((user) => {
				const stats = statsData.find((s) => s.userId === user.id);
				const data = {
					...user,
					wins: stats?.wins ?? 0,
					losses: stats?.losses ?? 0,
					online: false,
					friend:
						!!friends.find((friend) => friend.id === user.id) ||
						user.id === this.meData?.id ||
						!!friendRequests.find(
							(friend) => friend.toId === user.id,
						),
				};
				return data;
			});
		} catch (e) {
			console.error(e);
			this.dispatchEvent(errorLinkEvent);
			return;
		}
	}

	async buildDomElements() {
		this.classList.add("flex", "flex-col", "gap-3");
		for (const user of this.usersAggregated) {
			const userCard = new UsersUserComponent(user);
			this.append(userCard);
		}

		const nextPage = await this.checkNextPage();
		if (!(this.page === 1 && !nextPage)) {
			const pagination = new UsersPaginationComponent(
				this.page,
				nextPage,
			);
			this.append(pagination);
		}
	}

	userIsOnline(user: UserAggregated) {
		const onlineUser =
			this.chat.onlineUsers.find(
				(onlineUser) => onlineUser.id === user.id,
			) || user.id === this.chat.me?.id;
		return !!onlineUser;
	}

	applyOnlineStatus() {
		const allUserAggregated = this.usersAggregated;

		if (allUserAggregated === undefined) {
			return;
		}
		this.usersAggregated.forEach(
			(user) => (user.online = this.userIsOnline(user)),
		);

		const icons = [...this.getElementsByClassName("status-icon")];
		if (!icons) {
			return;
		}

		icons.map((icon) => {
			const status = allUserAggregated.find(
				(user) => user.nickname === icon.id,
			)?.online;
			const onlineStatusText = icon.nextElementSibling as HTMLElement;
			if (status) {
				icon.classList.remove("text-slate-500");
				icon.classList.add(
					"text-cyan-500",
					"glow-small",
					"bg-cyan-500/30",
				);
				onlineStatusText.innerText = "online";
			} else {
				icon.classList.remove(
					"text-cyan-500",
					"glow-small",
					"bg-cyan-500/30",
				);
				icon.classList.add("text-slate-500");
				onlineStatusText.innerText = "offline";
			}
		});
	}
}

customElements.define("users-view", UsersView);

export function createComponent(chat: ChatComponent) {
	return new UsersView(chat);
}
