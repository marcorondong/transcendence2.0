import type { User } from "../types/User";
import { IconComponent } from "./icon-component";
import { AvatarComponent } from "./shared/avatar-component";

class ProfileFriendsComponent extends HTMLElement {
	friends: User[];
	editableProfile: boolean;
	constructor(friends: User[], editableProfile: boolean) {
		super();
		this.editableProfile = editableProfile;
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
			container.id = "containerFriend-" + friend.id;
			const avatar = new AvatarComponent(friend);
			avatar.styleComponent("border-indigo-800");

			if (this.editableProfile) {
				const deleteIcon = new IconComponent("close", 3);
				const deleteButton = document.createElement("button");
				deleteButton.id = "delete-friend-button-" + friend.id;
				deleteButton.append(deleteIcon);
				deleteButton.classList.add(
					"pong-button",
					"pong-button-round",
					"pong-button-error",
					"absolute",
					"top-0",
					"right-0",
				);
				container.append(deleteButton);
			}

			const name = document.createElement("div");
			name.innerText = friend.nickname;
			name.classList.add(
				"text-sm",
				"w-full",
				"text-center",
				"overflow-hidden",
				"text-ellipsis",
			);
			container.append(avatar, name);
			this.append(container);
		}
	}
}

customElements.define("profile-friends-component", ProfileFriendsComponent);

export { ProfileFriendsComponent };
