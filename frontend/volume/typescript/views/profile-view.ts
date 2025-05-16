const user = {
	nickname: "HomerSimpson",
	username: "homer",
	email: "homer@springfield.com",
	wins: 21,
	losses: 19,
	online: false,
};

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

export class ProfileView extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		console.log("PROFILE VIEW has been CONNECTED");

		const mainCard = document.createElement("div");
		mainCard.classList.add("pong-card", "flex", "gap-4", "h-60");
		this.append(mainCard);

		const avatar = document.createElement("img");
		avatar.src = "/static-files/images/homer.png";
		avatar.classList.add("h-60", "w-50", "object-cover", "rounded-l-xl");

		const article = document.createElement("article");
		article.classList.add("flex", "flex-col", "p-8", "gap-4");

		const usernameContainer = document.createElement("div");

		const name = document.createElement("div");
		name.innerText = user.username;
		name.classList.add("text-2xl", "font-bold");

		const nameLabel = document.createElement("div");
		nameLabel.innerText = "User Name";
		nameLabel.classList.add("pong-label");
		usernameContainer.append(nameLabel, name);

		const nicknameContainer = document.createElement("div");

		const nickname = document.createElement("div");
		nickname.innerText = user.nickname;
		nickname.classList.add("text-2xl", "font-bold");

		const nicknameLabel = document.createElement("div");
		nicknameLabel.innerText = "Nickname";
		nicknameLabel.classList.add("pong-label");
		nicknameContainer.append(nicknameLabel, nickname);

		const emailContainer = document.createElement("div");

		const email = document.createElement("div");
		email.innerText = user.email;
		email.classList.add("text-2xl", "font-bold");

		const emailLabel = document.createElement("div");
		emailLabel.innerText = "Email";
		emailLabel.classList.add("pong-label");
		emailContainer.append(emailLabel, email);
		article.append(usernameContainer, nicknameContainer, emailContainer);

		mainCard.append(avatar, article);
	}

	disconnectedCallback() {
		console.log("PROFILE VIEW has been DISCONNECTED");
	}
}

customElements.define("profile-view", ProfileView);

export function createComponent() {
	return document.createElement("profile-view");
}
