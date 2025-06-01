import { IconComponent } from "../components/icon-component.js";
import { ChatComponent } from "../components/chat-component.js";
import { baseUrl, FetchConfig, fetchPong } from "../services/fetch.js";
import { User } from "../types/User.js";
import { Stats } from "../types/Pong.js";
import { notificationEvent } from "../services/events.js";

interface Users {
	id: string;
	nickname: string;
	wins: number;
	losses: number;
	online: boolean;
}
[];

export class UsersView extends HTMLElement {
	chat: ChatComponent;
	users: Users[] = [];
	usersData: User[] = [];
	page: number = 1;
	constructor(chat: ChatComponent) {
		super();
		this.chat = chat;
	}

	async connectedCallback() {
		console.log("users View has been connected");
		const paramsString = window.location.search;
		const searchParams = new URLSearchParams(paramsString);
		const pageFromQuery = Number(searchParams.get("page"));
		if (pageFromQuery && pageFromQuery > 0 && pageFromQuery < 1000) {
			this.page = Number(pageFromQuery);
		}

		const usersConfig: FetchConfig<User> = {
			url: `/api/users/?page=${this.page}`,
			header: { accept: "application/json" },
			method: "GET",
			// validator: validateUser,
		};
		try {
			window.history.pushState(
				{ path: baseUrl + "/users-view?page=" + this.page },
				"",
				baseUrl + "/users-view?page=" + this.page,
			);
			// TODO: replace this as with valibot parse
			this.usersData = (await fetchPong<User>(usersConfig)) as User[];
			console.log(this.usersData);
			const userIds = this.usersData.map((u) => u.id);
			console.log(userIds);
			const statsConfig: FetchConfig<User> = {
				url: `/pong-db/users-stats`,
				header: {
					"accept": "application/json",
					"Content-Type": "application/json",
				},
				method: "POST",
				body: { userIds: userIds },
				// validator: validateStats,
			};
			// TODO: replace this as with valibot parse
			const statsData = (await fetchPong(statsConfig)) as Stats[];
			console.log(statsData);

			this.users = this.usersData.map((user) => {
				const stats = statsData.find((s) => s.userId === user.id);
				const data = {
					id: user.id,
					nickname: user.nickname,
					wins: stats?.wins ?? 0,
					losses: stats?.losses ?? 0,
					online: false,
				};
				return data;
			});
		} catch (e) {}

		document.addEventListener("online-user", () => {
			console.log("somebody came online");
			this.applyOnlineStatus();
		});

		const container = document.createElement("div");
		container.classList.add(
			"flex",
			"flex-col",
			"gap-3",
			"sm:max-w-240",
			"sm:justify-self-center",
		);
		this.append(container);
		for (const user of this.users) {
			const card = document.createElement("div");
			card.classList.add(
				"pong-card",
				"flex-wrap",
				"pong-card-hover",
				"justify-center",
				"px-4",
				"pb-10",
				"pt-8",
				"sm:py-2",
				"flex",
				"sm:grid",
				"sm:grid-rows-0",
				"sm:grid-cols-[1fr_18rem_1fr_1fr_1fr_1fr]",
				"lg:grid-cols-[1fr_24rem_1fr_1fr_1fr_1fr]",
				"items-center",
				"gap-x-8",
				"gap-y-5",
				"sm:gap-2",
			);
			// AVATAR PICTURE
			const avatarContainer = document.createElement("div");
			avatarContainer.classList.add("flex", "justify-center");
			const avatar = document.createElement("img");
			avatarContainer.append(avatar);
			avatar.classList.add(
				"rounded-full",
				"sm:border-6",
				"border-8",
				"border-indigo-800",
				"w-30",
				"object-cover",
				"aspect-square",
				"sm:w-20",
			);
			avatar.src = "/static-files/images/avatar_placeholder.png";

			// NICKNAME
			const name = document.createElement("h2");
			name.innerText = user.nickname;
			name.classList.add(
				"flex-grow",
				"basis-full",
				"sm:flex-none",
				"px-4",
				"sm:text-xl",
				"text-2xl",
				"font-bold",
				"text-center",
				"sm:text-left",
				"text-nowrap",
				"text-ellipsis",
				"overflow-hidden",
			);

			// FRIENDREQUEST
			const friendIcon = new IconComponent("friend", 4);
			const friendButton = document.createElement("button");
			friendButton.classList.add(
				"pong-button",
				"pong-button-info",
				"pong-button-round",
				"justify-self-center",
			);
			friendButton.append(friendIcon);
			const friendLabel = document.createElement("div");
			friendLabel.innerText = "friend";
			friendLabel.classList.add(
				"text-xs",
				"text-slate-500",
				"absolute",
				"-bottom-5",
			);

			const friendContainer = document.createElement("div");
			friendContainer.classList.add("relative", "flex", "justify-center");
			friendContainer.append(friendButton, friendLabel);

			// WINS LOSSES STATS
			const wins = document.createElement("div");
			wins.innerText = "wins";
			wins.classList.add(
				"text-slate-500",
				"text-xs",
				"absolute",
				"-bottom-4",
			);
			const winsNumber = document.createElement("div");
			winsNumber.innerText = String(user.wins);
			winsNumber.classList.add(
				"text-4xl",
				"text-emerald-500",
				"font-bold",
			);
			const winsContainer = document.createElement("div");
			winsContainer.classList.add(
				"flex",
				"flex-col",
				"gap-1",
				"items-center",
				"relative",
			);
			winsContainer.append(winsNumber, wins);

			const losses = document.createElement("div");
			losses.innerText = "losses";
			losses.classList.add(
				"text-sm",
				"absolute",
				"text-xs",
				"text-slate-500",
				"-bottom-4",
			);
			const lossesNumber = document.createElement("div");
			lossesNumber.innerText = String(user.losses);
			lossesNumber.classList.add(
				"text-4xl",
				"text-rose-400",
				"font-bold",
			);
			const lossesContainer = document.createElement("div");
			lossesContainer.classList.add(
				"flex",
				"flex-col",
				"gap-1",
				"items-center",
				"relative",
			);
			lossesContainer.append(lossesNumber, losses);

			// ONLINE STATUS
			const status = document.createElement("div");
			status.classList.add(
				"flex",
				"flex-col",
				"items-center",
				"gap-2",
				"relative",
			);

			const statusIcon = new IconComponent("online", 6);
			statusIcon.classList.add("rounded-full", "border-0", "status-icon");
			statusIcon.id = user.nickname;
			const statusText = document.createElement("div");
			statusText.innerText = user.online ? "online" : "offline";
			statusText.classList.add(
				"text-xs",
				"text-slate-500",
				"absolute",
				"-bottom-6",
			);
			status.append(statusIcon, statusText);
			card.append(
				avatarContainer,
				name,
				friendContainer,
				winsContainer,
				lossesContainer,
				status,
			);
			container.append(card);
			this.applyOnlineStatus();
		}
	}
	userIsOnline(user: Users) {
		const onlineUser =
			this.chat.onlineUsers.find(
				(onlineUser) => onlineUser.id === user.id,
			) || user.id === this.chat.me?.id;
		const returnValue = !!onlineUser;
		console.log("user", user.nickname, "online:", returnValue);
		return returnValue;
	}

	disconnectedCallback() {
		console.log("USERS VIEW has been DISCONNECTED");
	}

	applyOnlineStatus() {
		const allUsers = this.users;

		console.log("start applying online status");
		if (allUsers === undefined) {
			return;
		}
		this.users.forEach((user) => (user.online = this.userIsOnline(user)));

		const icons = [...this.getElementsByClassName("status-icon")];
		if (!icons) {
			return;
		}

		console.log("found icons");
		icons.map((icon) => {
			const status = allUsers.find(
				(user) => user.nickname === icon.id,
			)?.online;
			if (status) {
				icon.classList.remove("text-slate-500");
				icon.classList.add(
					"text-cyan-500",
					"glow-small",
					"bg-cyan-500/30",
				);
			} else {
				icon.classList.remove(
					"text-cyan-500",
					"glow-small",
					"bg-cyan-500/30",
				);
				icon.classList.add("text-slate-500");
			}
		});
	}
}

customElements.define("users-view", UsersView);

export function createComponent(chat: ChatComponent) {
	return new UsersView(chat);
}
