import { FetchUsers } from "../services/fetch-users";
import type { MatchHistory, User } from "../types/User";
import { AvatarComponent } from "./shared/avatar-component";
import { NicknameComponent } from "./shared/nickname-component";

class ProfileMatchHistoryComponent extends HTMLElement {
	history: MatchHistory;
	currentUser: User;
	constructor(matchHistory: MatchHistory, currentUser: User) {
		super();
		this.currentUser = currentUser;
		this.history = matchHistory;
	}

	async connectedCallback() {
		const opponentUserId =
			this.history.loserId === this.currentUser.id
				? this.history.winnerId
				: this.history.loserId;
		try {
			const opponentUser = await FetchUsers.user(opponentUserId);
			this.buildDomElements(this.currentUser, opponentUser);
		} catch (e) {
			console.log(e);
		}
	}
	disconnectedCallback() {}

	buildDomElements(current: User, opponent: User) {
		this.classList.add(
			"pong-card",
			"flex-wrap",
			"pong-card-hover",
			"justify-center",
			"px-4",
			"pb-10",
			"pt-8",
			"sm:py-4",
			"flex",
			"flex-col",
			"sm:grid",
			"sm:grid-rows-0",
			"sm:grid-cols-[3rem_8rem_1fr_8rem_3rem]",
			"lg:grid-cols-[5rem_12rem_1fr_12rem_5rem]",
			"items-center",
			"gap-x-8",
			"gap-y-3",
			"sm:gap-2",
			"relative",
		);

		// AVATAR PICTURE
		const currentAvatar = new AvatarComponent(current);
		currentAvatar.classList.add("hidden", "sm:block");
		const opponentAvatar = new AvatarComponent(opponent);
		opponentAvatar.classList.add("hidden", "sm:block");

		// NICKNAME
		const currentNickname = new NicknameComponent(current);
		const opponentNickname = new NicknameComponent(opponent);
		opponentNickname.classList.add("justify-self-end");

		const currentScore =
			current.id === this.history.winnerId
				? this.history.winnerScore
				: this.history.loserScore;

		const opponentScore =
			opponent.id === this.history.winnerId
				? this.history.winnerScore
				: this.history.loserScore;

		//SCORE
		const scoreContainer = document.createElement("div");
		scoreContainer.classList.add(
			"flex",
			"gap-1",
			"justify-center",
			"text-5xl",
			"sm:text-4xl",
			"font-bold",
		);
		const currentScoreDiv = document.createElement("div");
		currentScoreDiv.innerText = String(currentScore);
		const opponentScoreDiv = document.createElement("div");
		opponentScoreDiv.innerText = String(opponentScore);
		const scoreSeperatorDiv = document.createElement("div");
		scoreSeperatorDiv.innerText = ":";

		if (currentScore > opponentScore) {
			currentAvatar.styleComponent("border-green-600/80");
			opponentAvatar.styleComponent("border-rose-600/70");
		} else {
			currentAvatar.styleComponent("border-rose-600/70");
			opponentAvatar.styleComponent("border-emerald-600/80");
		}

		scoreContainer.append(
			currentScoreDiv,
			scoreSeperatorDiv,
			opponentScoreDiv,
		);

		const date = new Date(this.history.createdAt);
		const formattedDate = date.toLocaleString("en-GB", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});

		const dateDiv = document.createElement("div");
		dateDiv.classList.add(
			"text-[0.7rem]",
			"text-xs",
			"dark:text-slate-500",
			"text-indigo-900",
			"col-span-full",
			"justify-self-center",
			"absolute",
			"sm:bottom-1",
			"bottom-2",
			// "font-bold",
		);
		dateDiv.innerText = "Played on " + formattedDate;

		// ADD ALL ELEMENTS TO COMPONENT
		this.append(
			currentAvatar,
			currentNickname,
			scoreContainer,
			opponentNickname,
			opponentAvatar,
			dateDiv,
		);
	}
}

customElements.define(
	"profile-match-history-component",
	ProfileMatchHistoryComponent,
);

export { ProfileMatchHistoryComponent };
