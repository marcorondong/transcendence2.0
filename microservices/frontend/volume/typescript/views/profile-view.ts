import { ChatComponent } from "../components/chat-component.js";
import { MatchHistory, User } from "../types/User.js";
import { FetchUsers } from "../services/fetch-users.js";
import { FetchPongDb } from "../services/fetch-pong-db.js";
import { ProfileDetailComponent } from "../components/profile-detail-component.js";
import { ProfileMatchHistoryComponent } from "../components/profile-match-history-component.js";

export class ProfileView extends HTMLElement {
	chat: ChatComponent;
	userData: User | null;
	userId: string | null = null;
	matchHistory: MatchHistory[] | null;
	constructor(chat: ChatComponent) {
		super();
		this.chat = chat;
	}

	async connectedCallback() {
		console.log("PROFILE VIEW has been CONNECTED");

		this.userIdFromQueryParam();
		await this.fetchData();
		this.buildDomElements();
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

	buildDomElements() {
		const headline = document.createElement("h1");
		headline.innerText = "Your Profile";
		headline.classList.add("pong-heading", "pong-heading-big", "mb-6");
		this.append(headline);
		if (this.userData) {
			const detailCard = new ProfileDetailComponent(this.userData);
			this.append(detailCard);
		}
		if (this.matchHistory) {
			for (let match of this.matchHistory) {
				const matchCard = new ProfileMatchHistoryComponent(match);
				this.append(matchCard);
			}
		}
	}
}

customElements.define("profile-view", ProfileView);

export function createComponent(chat: ChatComponent) {
	return new ProfileView(chat);
}
