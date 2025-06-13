import { ChatComponent } from "../components/chat-component.js";
import { MatchHistory, User } from "../types/User.js";
import { FetchUsers } from "../services/fetch-users.js";
import { FetchPongDb } from "../services/fetch-pong-db.js";
import { ProfileDetailComponent } from "../components/profile-detail-component.js";
import { ProfileMatchHistoryComponent } from "../components/profile-match-history-component.js";
import { HeadlineComponent } from "../components/shared/headline-component.js";
import { ProfileFriendsComponent } from "../components/profile-friends-component.js";

export class ProfileView extends HTMLElement {
	chat: ChatComponent;
	userData: User | null = null;
	userId: string | null = null;
	matchHistory: MatchHistory[] | null = null;

	friendsList = [
		"Lagzilla",
		"NoScopeMop",
		"404SkillNotFound",
		"CtrlAltDefeat",
		"CampfireKing",
		"Teabaggins",
		"SnaccAttack",
	];

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
			this.userData = await FetchUsers.user(id);
			this.matchHistory = await FetchPongDb.matchHistory(id);
			// add fetch for friends list here
		} catch (e) {
			console.log(e);
		}
	}

	buildDomElements() {
		this.classList.add("flex", "flex-col", "gap-3");
		if (this.userData) {
			this.append(new HeadlineComponent("Profile"));
			const detail = new ProfileDetailComponent(this.userData);
			detail.classList.add("mb-12");
			this.append(detail);
		}

		if (this.friendsList) {
			this.append(new HeadlineComponent("Friends List"));
			this.append(new ProfileFriendsComponent(this.friendsList));
		}

		if (this.matchHistory && this.userData) {
			this.append(new HeadlineComponent("Match History"));
			for (let match of this.matchHistory) {
				const matchCard = new ProfileMatchHistoryComponent(
					match,
					this.userData,
				);
				this.append(matchCard);
			}
		}
	}
}

customElements.define("profile-view", ProfileView);

export function createComponent(chat: ChatComponent) {
	return new ProfileView(chat);
}
