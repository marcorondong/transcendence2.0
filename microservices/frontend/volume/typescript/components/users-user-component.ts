import { User, UserAggregated } from "../types/User.js";
import { IconComponent } from "./icon-component.js";
import { AvatarComponent } from "./shared/avatar-component.js";
import { NicknameComponent } from "./shared/nickname-component.js";

class UsersUserComponent extends HTMLElement {
	user: UserAggregated;
	constructor(user: UserAggregated) {
		super();
		this.user = user;
	}

	connectedCallback() {
		this.classList.add(
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
			"sm:grid-cols-[4rem_50%_1fr_1fr_1fr_1fr]",
			"items-center",
			"gap-x-8",
			"gap-y-5",
			"sm:gap-2",
		);
		// AVATAR PICTURE
		const avatar = new AvatarComponent(this.user);
		avatar.styleComponent("border-indigo-800");

		// NICKNAME
		const nickname = new NicknameComponent(this.user);

		const containerStyles = [
			"relative",
			"flex",
			"flex-col",
			"items-center",
			"justify-end",
			"h-16",
		];

		// FRIENDREQUEST
		const friendIcon = new IconComponent("friend", 4);
		const friendButton = document.createElement("button");
		friendButton.classList.add(
			"pong-button",
			"pong-button-info",
			"pong-button-round",
			"justify-self-center",
			"button-friend",
		);
		friendButton.append(friendIcon);
		friendButton.id = "friend-" + this.user.id;
		const friendLabel = document.createElement("div");
		friendLabel.innerText = "friend";
		friendLabel.classList.add("text-xs", "text-slate-500");

		const friendContainer = document.createElement("div");
		friendContainer.classList.add(...containerStyles, "gap-2");
		friendContainer.append(friendButton, friendLabel);

		// WINS LOSSES STATS
		const wins = document.createElement("div");
		wins.innerText = "wins";
		wins.classList.add("text-slate-500", "text-xs");
		const winsNumber = document.createElement("div");
		winsNumber.innerText = String(this.user.wins);
		winsNumber.classList.add("text-4xl", "text-emerald-500", "font-bold");
		const winsContainer = document.createElement("div");
		winsContainer.classList.add(...containerStyles, "gap-1");
		winsContainer.append(winsNumber, wins);

		const losses = document.createElement("div");
		losses.innerText = "losses";
		losses.classList.add("text-xs", "text-slate-500");
		const lossesNumber = document.createElement("div");
		lossesNumber.innerText = String(this.user.losses);
		lossesNumber.classList.add("text-4xl", "text-rose-400", "font-bold");
		const lossesContainer = document.createElement("div");
		lossesContainer.classList.add(...containerStyles, "gap-1");
		lossesContainer.append(lossesNumber, losses);

		// ONLINE STATUS
		const statusContainer = document.createElement("div");
		statusContainer.classList.add(...containerStyles, "gap-2");

		const statusIcon = new IconComponent("online", 7);
		statusIcon.classList.add("rounded-full", "border-0", "status-icon");
		statusIcon.id = this.user.nickname;
		const statusText = document.createElement("div");
		statusText.innerText = this.user.online ? "online" : "offline";
		statusText.classList.add("text-xs", "text-slate-500");
		statusContainer.append(statusIcon, statusText);
		this.append(
			avatar,
			nickname,
			friendContainer,
			winsContainer,
			lossesContainer,
			statusContainer,
		);
	}

	disconnectedCallback() {}
}

customElements.define("users-user-component", UsersUserComponent);

export { UsersUserComponent };
