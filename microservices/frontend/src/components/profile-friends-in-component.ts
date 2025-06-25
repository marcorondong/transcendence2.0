import type { FriendRequestPending } from "../types/Fetch";
import { IconComponent } from "./icon-component";
import { AvatarComponent } from "./shared/avatar-component";

class ProfileFriendsInComponent extends HTMLElement {
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
			container.id = "containerFriendIn-" + friend.id;
			const avatar = new AvatarComponent(friend.from);
			avatar.styleComponent("border-indigo-800");

			const deleteIcon = new IconComponent("close", 3);
			deleteIcon.id = friend.fromId;
			const deleteButton = document.createElement("button");
			deleteButton.id = "delete-in-button-" + friend.id;
			deleteButton.append(deleteIcon);
			deleteButton.classList.add(
				"pong-button",
				"pong-button-round",
				"pong-button-error",
				"absolute",
				"top-0",
				"right-0",
			);

			const acceptIcon = new IconComponent("check", 3);
			acceptIcon.id = friend.fromId;
			const acceptButton = document.createElement("button");
			acceptButton.id = "accept-in-button-" + friend.id;
			acceptButton.append(acceptIcon);

			acceptButton.classList.add(
				"pong-button",
				"pong-button-round",
				"pong-button-success",
				"absolute",
				"top-0",
				"left-0",
			);

			const name = document.createElement("div");
			name.innerText = friend.from.nickname;
			name.classList.add(
				"text-sm",
				"w-full",
				"text-center",
				"overflow-hidden",
				"text-ellipsis",
			);
			container.append(avatar, name, deleteButton, acceptButton);
			this.append(container);
		}
	}
}

customElements.define(
	"profile-friends-in-component",
	ProfileFriendsInComponent,
);

export { ProfileFriendsInComponent };
