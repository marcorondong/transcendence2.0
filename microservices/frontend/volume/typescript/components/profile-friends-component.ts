import { User } from "../types/User.js";
import { AvatarComponent } from "./shared/avatar-component.js";

const fakeUser: User = {
	id: "blah",
	createdAt: "whoa",
	email: "writeme",
	nickname: "mario",
	picture: "asdf",
	updatedAt: "now",
	username: "mariouser",
};

class ProfileFriendsComponent extends HTMLElement {
	friends: string[];
	constructor(friends: string[]) {
		super();
		this.friends = friends;
	}

	connectedCallback() {
		this.classList.add(
			"pong-card",
			"p-8",
			"grid",
			"gap-6",
			"[grid-template-columns:repeat(auto-fit,minmax(90px,1fr))]",
		);
		for (let friend of this.friends) {
			const container = document.createElement("div");
			container.classList.add(
				"flex",
				"flex-col",
				"gap-2",
				"items-center",
			);
			const avatar = new AvatarComponent(fakeUser);
			avatar.styleComponent("border-indigo-800");
			avatar.classList.add("w-30");

			const name = document.createElement("div");
			name.innerText = friend;
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
	disconnectedCallback() {}

	buildDomElements() {}
}

customElements.define("profile-friends-component", ProfileFriendsComponent);

export { ProfileFriendsComponent };
