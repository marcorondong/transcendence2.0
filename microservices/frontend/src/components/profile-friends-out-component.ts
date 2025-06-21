import { notificationEvent } from "../services/events";
import { FetchUsers } from "../services/fetch-users";
import type { FriendRequestPending } from "../types/Fetch";
import { IconComponent } from "./icon-component";
import { AvatarComponent } from "./shared/avatar-component";

class ProfileFriendsOutComponent extends HTMLElement {
	friends: FriendRequestPending[];
	myId: string;
	constructor(friends: FriendRequestPending[], myId: string) {
		super();
		this.friends = friends;
		this.myId = myId;
	}

	handleEvent(event: Event) {
		const handlerName =
			"on" + event.type.charAt(0).toUpperCase() + event.type.slice(1);
		const handler = this[handlerName as keyof this];
		if (typeof handler === "function") {
			handler.call(this, event);
		}
	}

	onClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target) {
			return;
		}

		const button = target.closest("button");
		if (button) {
			this.handleDeleteButton(button);
			// this.handleDeleteButton(button);
		}
	}

	async handleDeleteButton(button: HTMLButtonElement) {
		if (!button.id.includes("delete-button")) {
			return;
		}

		let id = button.id;
		id = id.replace(/^delete-button-/, "");
		console.log("trying to delete id:", id);
		try {
			FetchUsers.friendRequestDelete(id);
			this.friends = await FetchUsers.friendRequestGet(this.myId);
			const friendContainer = document.getElementById(
				"containerFrienOut-" + id,
			);
			if (friendContainer) {
				friendContainer.remove();
			}
			document.dispatchEvent(
				notificationEvent(
					"Friend request smashed to pieces! ... who needs friends anyway ...",
					"success",
				),
			);
			if (this.friends.length === 0) {
				const self = document.getElementById(
					"friendRequestOutContainer",
				);
				if (self) {
					self.remove();
				}
			}
		} catch (e) {
			console.error(e);
		}
	}

	connectedCallback() {
		this.addEventListener("click", this);
		this.buildDomElements();
	}
	disconnectedCallback() {
		this.removeEventListener("click", this);
	}

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
			container.id = "containerFrienOut-" + friend.id;
			const avatar = new AvatarComponent(friend.to);
			avatar.styleComponent("border-indigo-800");

			const deleteIcon = new IconComponent("close", 2);
			const deleteButton = document.createElement("button");
			deleteButton.id = "delete-button-" + friend.id;
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
