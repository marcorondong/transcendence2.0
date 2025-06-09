import { User } from "../../types/User";

class NicknameComponent extends HTMLElement {
	userData: User;
	name = document.createElement("a");
	constructor(userData: User) {
		super();
		this.userData = userData;
	}

	addClass(className: string) {
		this.name.classList.add(className);
	}

	connectedCallback() {
		this.classList.add(
			"flex-grow",
			"basis-full",
			"text-center",
			"sm:text-left",
		);
		this.name.id = this.userData.id;
		this.name.innerText = this.userData.nickname;
		this.name.classList.add(
			"sm:flex-none",
			"px-4",
			"md:text-xl",
			"text-base",
			"font-bold",
			"text-nowrap",
			"text-ellipsis",
			"overflow-hidden",
			"cursor-pointer",
			"user-link",
			"pong-link",
		);
		this.append(this.name);
	}

	disconnectedCallback() {}
}

customElements.define("nickname-component", NicknameComponent);

export { NicknameComponent };
