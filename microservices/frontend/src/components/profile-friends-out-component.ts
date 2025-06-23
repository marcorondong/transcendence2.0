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
		this.buildDomElements();
	}
	disconnectedCallback() {}

	buildDomElements() {
		this.classList.add(
			"pong-card",
			"p-8",
			"flex",
			"flex-wrap",
			"justify-start",
			"gap-6",
		);
		this.buildFriends();
	}

	buildFriends() {
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
			container.id = "containerFriendOut-" + friend.id;
			const avatar = new AvatarComponent(friend.to);
			avatar.styleComponent("border-indigo-800");

			const deleteIcon = new IconComponent("close", 3);
			const deleteButton = document.createElement("button");
			deleteButton.id = "delete-out-button-" + friend.id;
			deleteButton.append(deleteIcon);
			deleteButton.classList.add(
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
			container.append(avatar, name, deleteButton);
			this.append(container);
		}
	}
}

customElements.define(
	"profile-friends-out-component",
	ProfileFriendsOutComponent,
);

export { ProfileFriendsOutComponent };
