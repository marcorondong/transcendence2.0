import { ChatComponent } from "../components/chat-component.js";
import { User } from "../types/User.js";
import { FetchUsers } from "../services/fetch-users.js";
import { FetchPongDb } from "../services/fetch-pong-db.js";

export class ProfileView extends HTMLElement {
	chat: ChatComponent;
	userData: User;
	userId: string | null = null;
	matchHistory: any;
	constructor(chat: ChatComponent) {
		super();
		this.chat = chat;
	}

	async connectedCallback() {
		console.log("PROFILE VIEW has been CONNECTED");

		// FETCH DATA
		this.userIdFromQueryParam();
		await this.fetchData();

		const headline = document.createElement("h1");
		headline.innerText = "Your Profile";
		headline.classList.add("pong-heading", "pong-heading-big", "mb-6");
		this.append(headline);

		const mainCard = document.createElement("div");
		mainCard.classList.add(
			"pong-card",
			"flex",
			"flex-col",
			"sm:flex-row",
			"items-stretch",
			"overflow-hidden",
		);
		this.append(mainCard);

		const avatarContainer = document.createElement("div");
		const avatar = document.createElement("img");
		avatar.src = "/static-files/images/homer.png";
		avatar.classList.add(
			"h-full",
			"object-cover",
			"rounded-t-xl",
			"sm:rounded-t-none",
			"sm:rounded-l-xl",
			"sm:w-100",
		);
		avatarContainer.append(avatar);

		const article = document.createElement("article");
		article.classList.add(
			"grid",
			"[grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]",
			"gap-4",
			"p-6",
			"items-center",
			"self-center",
			"w-full",
		);

		// USERNAME
		const usernameContainer = document.createElement("div");
		const name = document.createElement("div");
		name.innerText = this.userData.username;
		name.classList.add("pong-heading");
		const nameLabel = document.createElement("div");
		nameLabel.innerText = "User Name";
		nameLabel.classList.add("pong-label");
		usernameContainer.append(nameLabel, name);

		// NICKNAME
		const nicknameContainer = document.createElement("div");
		const nickname = document.createElement("div");
		nickname.innerText = this.userData.nickname;
		nickname.classList.add("pong-heading");
		const nicknameLabel = document.createElement("div");
		nicknameLabel.innerText = "Nickname";
		nicknameLabel.classList.add("pong-label");
		nicknameContainer.append(nicknameLabel, nickname);

		// EMAIL
		const emailContainer = document.createElement("div");
		const email = document.createElement("div");
		email.innerText = this.userData.email;
		email.classList.add("pong-heading");
		const emailLabel = document.createElement("div");
		emailLabel.innerText = "Email";
		emailLabel.classList.add("pong-label");
		emailContainer.append(emailLabel, email);
		article.append(usernameContainer, nicknameContainer, emailContainer);

		mainCard.append(avatarContainer, article);
	}

	disconnectedCallback() {
		console.log("PROFILE VIEW has been DISCONNECTED");
	}

	userIdFromQueryParam() {
		const paramsString = window.location.search;
		const searchParams = new URLSearchParams(paramsString);
		this.userId = searchParams.get("userId");
	}

	async fetchData() {
		try {
			//TODO: change the access to chat.me to a get requesest to users once
			//API endpoint for GET Me exists
			const id = this.userId ?? this.chat.me!.id;
			this.userData = await FetchUsers.users(id);
			this.matchHistory = await FetchPongDb.matchHistory(id);
		} catch (e) {
			console.log(e);
		}
	}

	async fetchMatchHistory() {}
}

customElements.define("profile-view", ProfileView);

export function createComponent(chat: ChatComponent) {
	return new ProfileView(chat);
}
