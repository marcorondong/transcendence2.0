import { TableComponent } from "../components/table-component.js";
import { IconComponent } from "../components/icon-component.js";

const users = [
	{
		nickname: "ShadowHunter whaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaat",
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

		const h1 = document.createElement("h1");
		h1.textContent = "Users";
		this.appendChild(h1);

		const container = document.createElement("div");
		container.classList.add("flex", "flex-col", "gap-3");
		this.append(container);
		for (const user of users) {
			const card = document.createElement("div");
			card.classList.add(
				"pong-card",
				"pong-card-hover",
				"px-4",
				"py-2",
				"grid",
				"grid-cols-[5rem_20rem_1fr_1fr_1fr]",
				"items-center",
				"gap-8",
				"relative",
			);
			const avatar = document.createElement("img");
			avatar.classList.add(
				"rounded-full",
				"border-6",
				"border-indigo-800",
			);
			avatar.src = "/static-files/images/avatar_placeholder.png";
			avatar.width = 80;

			const name = document.createElement("h2");
			name.innerText = user.nickname;
			name.classList.add(
				"text-xl",
				"font-bold",
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
				"bottom-3",
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
			);
			winsContainer.append(winsNumber, wins);

			const losses = document.createElement("div");
			losses.innerText = "losses";
			losses.classList.add(
				"text-sm",
				"absolute",
				"text-xs",
				"text-slate-500",
				"bottom-3",
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
			);
			lossesContainer.append(lossesNumber, losses);

			const status = document.createElement("div");
			status.classList.add(
				"justify-self-end",
				"px-5",
				"flex",
				"flex-col",
				"items-center",
				"gap-2",
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
				"bottom-3",
			);
			status.append(statusIcon, statusText);
			card.append(avatar, name, winsContainer, lossesContainer, status);
			container.append(card);
			this.applyOnlineStatus();
		}
	}

	disconnectedCallback() {
		console.log("USERS VIEW has been DISCONNECTED");
	}

	applyOnlineStatus() {
		const icons = [...this.getElementsByClassName("status-icon")];
		console.log("icons:", icons);
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
