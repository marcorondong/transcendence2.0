import type { FriendRequestPending } from "../types/Fetch";
import { IconComponent } from "./icon-component";
import { AvatarComponent } from "./shared/avatar-component";

class ProfileFriendsOutComponent extends HTMLElement {
	friends: FriendRequestPending[];
	constructor(friends: FriendRequestPending[]) {
		super();
		this.friends = friends;
	}

	connectedCallback() {
		this.classList.add(
			"pong-card",
			"p-8",
			"grid",
			"justify-items-center",
			"[grid-template-columns:repeat(auto-fit,minmax(60px,1fr))]",
			"gap-6",
		);
		for (let friend of this.friends) {
			const container = document.createElement("div");
			container.classList.add(
				"flex",
				"flex-col",
				"gap-2",
				"items-center",
				"relative",
				"w-20",
			);
			const avatar = new AvatarComponent(friend.to);
			avatar.styleComponent("border-indigo-800");

			const xIcon = new IconComponent("close", 2);
			const xButton = document.createElement("button");
			xButton.append(xIcon);
			xButton.classList.add(
				"pong-button",
				"pong-button-round",
				"pong-button-error",
				"absolute",
				"top-0",
				"right-0",
			);

			const name = document.createElement("div");
			name.innerText = friend.to.nickname;
			name.classList.add(
				"text-sm",
				"w-full",
				"text-center",
				"overflow-hidden",
				"text-ellipsis",
			);
			container.append(avatar, name, xButton);
			this.append(container);
		}
	}
	disconnectedCallback() {}

	buildDomElements() {}
}

customElements.define(
	"profile-friends-out-component",
	ProfileFriendsOutComponent,
);

export { ProfileFriendsOutComponent };
