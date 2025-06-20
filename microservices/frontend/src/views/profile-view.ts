import { ChatComponent } from "../components/chat-component";
import type { MatchHistory, User } from "../types/User";
import { FetchUsers } from "../services/fetch-users";
import { FetchPongDb } from "../services/fetch-pong-db";
import { ProfileDetailComponent } from "../components/profile-detail-component";
import { ProfileMatchHistoryComponent } from "../components/profile-match-history-component";
import { HeadlineComponent } from "../components/shared/headline-component";
import { ProfileFriendsComponent } from "../components/profile-friends-component";
import { FetchAuth } from "../services/fetch-auth";
import type { FriendRequestPending, Me } from "../types/Fetch";

export class ProfileView extends HTMLElement {
	chat: ChatComponent;
	userData: User | null = null;
	userId: string | null = null;
	matchHistory: MatchHistory[] | null = null;
	friendRequestList: FriendRequestPending[] | null = null;

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
			const meData: Me = await FetchAuth.verifyConnection();
			const id = this.userId ?? meData.id;
			this.friendRequestList = await FetchUsers.friendRequestGet(
				meData.id,
			);
			console.log("!!!!!!friend requests", this.friendRequestList);
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
			this.append(new HeadlineComponent("Friends"));
			if (this.friendRequestList) {
				this.append(
					new ProfileFriendsComponent(this.friendRequestList),
				);
			}
			this.append(new HeadlineComponent("Incoming Friend Requests"));
			if (this.friendRequestList) {
				this.append(
					new ProfileFriendsComponent(this.friendRequestList),
				);
			}
			this.append(new HeadlineComponent("Outgoing Friend Requests"));
			if (this.friendRequestList) {
				this.append(
					new ProfileFriendsComponent(this.friendRequestList),
				);
			}
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
