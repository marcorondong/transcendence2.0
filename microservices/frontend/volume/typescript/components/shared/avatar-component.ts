import { User } from "../../types/User.js";

class AvatarComponent extends HTMLElement {
	userData: User;
	avatar = document.createElement("img");
	constructor(userData: User) {
		super();
		this.userData = userData;
	}

	connectedCallback() {
		this.classList.add("flex", "justify-center", "w-full");

		this.avatar.classList.add(
			"w-30",
			"rounded-full",
			"lg:border-6",
			"border-4",
			"sm:w-auto",
			"object-cover",
			"aspect-square",
		);
		//TODO: replace this with url from user data
		this.avatar.src = "/static-files/images/avatar_placeholder.png";
		this.append(this.avatar);
	}

	disconnectedCallback() {}

	styleComponent(className: string) {
		this.avatar.classList.add(className);
	}
}

customElements.define("avatar-component", AvatarComponent);

export { AvatarComponent };
