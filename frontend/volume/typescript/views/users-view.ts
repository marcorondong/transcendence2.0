import { IconComponent } from "../components/icon-component.js";

const users = [
	{
		nickname: "ShadowHunter",
		wins: 34,
		losses: 12,
		online: true,
	},
	{ nickname: "PixelPirate", wins: 21, losses: 19, online: false },
	{ nickname: "NoScopeKing", wins: 48, losses: 5, online: true },
	{ nickname: "LavaWizard", wins: 17, losses: 22, online: false },
	{ nickname: "SneakyPanda", wins: 29, losses: 18, online: true },
	{ nickname: "QuantumKnight", wins: 40, losses: 10, online: false },
	{ nickname: "TurboToad", wins: 5, losses: 30, online: false },
	{ nickname: "EpicElf", wins: 26, losses: 15, online: true },
	{ nickname: "RageMage", wins: 38, losses: 7, online: true },
	{ nickname: "SilentStorm", wins: 13, losses: 27, online: false },
];

export class UsersView extends HTMLElement {
	constructor() {
		super();
	}

	users = users;

	connectedCallback() {
		console.log("users View has been connected");

		// const h1 = document.createElement("h1");
		// h1.textContent = "Users";
		// this.appendChild(h1);

		const container = document.createElement("div");
		container.classList.add(
			"flex",
			"flex-col",
			"gap-3",
			"sm:max-w-240",
			"sm:justify-self-center",
		);
		this.append(container);
		for (const user of users) {
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
				"sm:grid-cols-[1fr_18rem_1fr_1fr_1fr]",
				"lg:grid-cols-[1fr_24rem_1fr_1fr_1fr]",
				"items-center",
				"gap-x-8",
				"gap-y-5",
				"sm:gap-2",
			);
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
				"sm:w-20",
			);
			avatar.src = "/static-files/images/avatar_placeholder.png";

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
			const wins = document.createElement("div");
			wins.innerText = "wins";
			wins.classList.add(
				"text-slate-500",
				"text-xs",
				"absolute",
				"-bottom-3",
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
				"-bottom-3",
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
				"-bottom-5",
			);
			status.append(statusIcon, statusText);
			card.append(
				avatarContainer,
				name,
				winsContainer,
				lossesContainer,
				status,
			);
			container.append(card);
			this.applyOnlineStatus();
		}
	}

	disconnectedCallback() {
		console.log("USERS VIEW has been DISCONNECTED");
	}

	applyOnlineStatus() {
		const icons = [...this.getElementsByClassName("status-icon")];
		icons.map((icon) => {
			const status = this.users.find(
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

export function createComponent() {
	return document.createElement("users-view");
}

// async function getData() {
// 	const url = "https://localhost:8080/api/v1/users/list/?page=1";
// 	try {
// 		const response = await fetch(url, {
// 			method: "GET",
// 			mode: "cors",
// 			headers: {
// 				"Content-Type": "application/json",
// 			},
// 		});
// 		if (!response.ok) {
// 			throw new Error(`Response status: ${response.status}`);
// 		}

// 		return response.json();
// 	} catch (e) {
// 		console.error("Trying to fetch users in users-component;", e);
// 		return null;
// 	}
// }
