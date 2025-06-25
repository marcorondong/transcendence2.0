import { baseUrl } from "../../services/fetch";
import type { User } from "../../types/User";

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
			"object-cover",
			"aspect-square",
		);
		this.avatar.src = baseUrl + this.userData.picture;
		this.append(this.avatar);
	}

	disconnectedCallback() {}

	styleComponent(className: string) {
		this.avatar.classList.add(className);
	}
}

customElements.define("avatar-component", AvatarComponent);

export { AvatarComponent };
