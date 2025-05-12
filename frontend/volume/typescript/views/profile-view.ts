const user = { nickname: "PixelPirate", wins: 21, losses: 19, online: false };

const friends = [
	{ nickname: "NoScopeKing", wins: 48, losses: 5, online: true },
	{ nickname: "LavaWizard", wins: 17, losses: 22, online: false },
	{ nickname: "SneakyPanda", wins: 29, losses: 18, online: true },
	{ nickname: "QuantumKnight", wins: 40, losses: 10, online: false },
];

const friendRequests = [
	{ nickname: "TurboToad", wins: 5, losses: 30, online: false },
	{ nickname: "EpicElf", wins: 26, losses: 15, online: true },
	{ nickname: "RageMage", wins: 38, losses: 7, online: true },
	{ nickname: "SilentStorm", wins: 13, losses: 27, online: false },
];

//yooo

export class ProfileView extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		console.log("PROFILE VIEW has been CONNECTED");
		const h1 = document.createElement("h1");
		h1.textContent = "Profile";
		this.appendChild(h1);
	}

	disconnectedCallback() {
		console.log("PROFILE VIEW has been DISCONNECTED");
	}
}

customElements.define("profile-view", ProfileView);

export function createComponent() {
	return document.createElement("profile-view");
}
