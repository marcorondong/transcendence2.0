import { IconComponent } from "../components/icon-component.js";
import { ChatComponent } from "../components/chat-component.js";
import { baseUrl, FetchConfig, fetchPong } from "../services/fetch.js";
import { User } from "../types/User.js";
import { Stats } from "../types/Pong.js";

interface UserAggregated {
	id: string;
	nickname: string;
	wins: number;
	losses: number;
	online: boolean;
}
[];

export class UsersView extends HTMLElement {
	chat: ChatComponent;
	usersAggregated: UserAggregated[] = [];
	usersData: User[] = [];
	page: number = 1;
	constructor(chat: ChatComponent) {
		super();
		this.chat = chat;
	}

	async connectedCallback() {
		console.log("users View has been connected");
		await this.aggregateData();
		this.buildDomElements();

		document.addEventListener("online-user", () => {
			console.log("somebody came online");
			this.applyOnlineStatus();
		});
		this.applyOnlineStatus();
		this.addEventListener("click", this);
	}

	disconnectedCallback() {
		console.log("USERS VIEW has been DISCONNECTED");
		this.removeEventListener("click", this);
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
			this.handleButtonLeft(button);
			this.handleButtonRight(button);
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
		await this.aggregateData();
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
		await this.aggregateData();
		this.buildDomElements();
		this.applyOnlineStatus();
	}

	async aggregateData() {
		const paramsString = window.location.search;
		const searchParams = new URLSearchParams(paramsString);
		const pageFromQuery = Number(searchParams.get("page"));
		if (pageFromQuery && pageFromQuery > 0 && pageFromQuery < 1000) {
			this.page = Number(pageFromQuery);
		}
		const urlApi = `/api/users/?page=${this.page}`;
		const urlBrowser = baseUrl + "/users-view?page=" + this.page;

		const usersConfig: FetchConfig<User> = {
			url: urlApi,
			header: { accept: "application/json" },
			method: "GET",
			// validator: validateUser,
		};
		try {
			window.history.pushState({ path: urlBrowser }, "", urlBrowser);
			// TODO: replace this as with valibot parse
			this.usersData = (await fetchPong<User>(usersConfig)) as User[];
			console.log(this.usersData);
			const userIds = this.usersData.map((u) => u.id);
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

			this.usersAggregated = this.usersData.map((user) => {
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
	}
	checkNextPage() {
		// const usersConfig: FetchConfig<User> = {
		// 	url: urlApi,
		// 	header: { accept: "application/json" },
		// 	method: "GET",
		// 	// validator: validateUser,
		// };
	}

	buildDomElements() {
		const container = document.createElement("div");
		container.classList.add(
			"flex",
			"flex-col",
			"gap-3",
			"sm:max-w-240",
			"sm:justify-self-center",
		);
		this.append(container);
		for (const user of this.usersAggregated) {
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

			const containerStyles = [
				"relative",
				"flex",
				"flex-col",
				"items-center",
				"justify-end",
				"h-16",
			];

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
			friendLabel.classList.add("text-xs", "text-slate-500");

			const friendContainer = document.createElement("div");
			friendContainer.classList.add(...containerStyles, "gap-2");
			friendContainer.append(friendButton, friendLabel);

			// WINS LOSSES STATS
			const wins = document.createElement("div");
			wins.innerText = "wins";
			wins.classList.add("text-slate-500", "text-xs");
			const winsNumber = document.createElement("div");
			winsNumber.innerText = String(user.wins);
			winsNumber.classList.add(
				"text-4xl",
				"text-emerald-500",
				"font-bold",
			);
			const winsContainer = document.createElement("div");
			winsContainer.classList.add(...containerStyles, "gap-1");
			winsContainer.append(winsNumber, wins);

			const losses = document.createElement("div");
			losses.innerText = "losses";
			losses.classList.add("text-xs", "text-slate-500");
			const lossesNumber = document.createElement("div");
			lossesNumber.innerText = String(user.losses);
			lossesNumber.classList.add(
				"text-4xl",
				"text-rose-400",
				"font-bold",
			);
			const lossesContainer = document.createElement("div");
			lossesContainer.classList.add(...containerStyles, "gap-1");
			lossesContainer.append(lossesNumber, losses);

			// ONLINE STATUS
			const statusContainer = document.createElement("div");
			statusContainer.classList.add(...containerStyles, "gap-2");

			const statusIcon = new IconComponent("online", 7);
			statusIcon.classList.add("rounded-full", "border-0", "status-icon");
			statusIcon.id = user.nickname;
			const statusText = document.createElement("div");
			statusText.innerText = user.online ? "online" : "offline";
			statusText.classList.add("text-xs", "text-slate-500");
			statusContainer.append(statusIcon, statusText);
			card.append(
				avatarContainer,
				name,
				friendContainer,
				winsContainer,
				lossesContainer,
				statusContainer,
			);
			container.append(card);
		}
		const buttonClassList = [
			"pong-button",
			// "pong-button-round",
			"pong-button-primary",
		];
		const paginationContainer = document.createElement("div");
		paginationContainer.classList.add(
			"flex",
			"gap-5",
			"items-center",
			"self-center",
			"mt-5",
		);
		const buttonLeft = document.createElement("button");
		buttonLeft.classList.add(...buttonClassList);
		buttonLeft.id = "button-left";
		if (this.page === 1) {
			buttonLeft.setAttribute("disabled", "true");
		}
		const leftArrowIcon = new IconComponent("arrow_left", 3);
		buttonLeft.append(leftArrowIcon);
		const buttonRight = document.createElement("button");
		buttonRight.id = "button-right";
		buttonRight.classList.add(...buttonClassList);
		const rightArrowIcon = new IconComponent("arrow_right", 3);
		buttonRight.append(rightArrowIcon);
		const pageCount = document.createElement("div");
		pageCount.classList.add("font-bold", "text-sm", "text-slate-400");
		pageCount.innerText = `${this.page}`;

		paginationContainer.append(buttonLeft, pageCount, buttonRight);
		container.append(paginationContainer);
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

		console.log("start applying online status");
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
