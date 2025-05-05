import { TableComponent } from "../components/table-component.js";

const users = [
	{ nickname: "ShadowHunter", wins: 34, losses: 12, online: true },
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
			card.classList.add("pong-card", "p-4");
			const name = document.createElement("h2");
			name.innerText = user.nickname;
			name.classList.add("text-xl", "font-bold");
			const wins = document.createElement("div");
			wins.innerText = String(user.wins);
			const losses = document.createElement("div");
			losses.innerText = String(user.losses);
			const online = document.createElement("div");
			online.innerText = user.online ? "online" : "offline";
			card.append(name, wins, losses, online);
			container.append(card);
		}
	}

	disconnectedCallback() {
		console.log("USERS VIEW has been DISCONNECTED");
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
