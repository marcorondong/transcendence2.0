import { User } from "../types/User";

class ProfileDetailComponent extends HTMLElement {
	userData: User;
	constructor(userData: User) {
		super();
		this.userData = userData;
	}

	connectedCallback() {
		this.classList.add(
			"pong-card",
			"flex",
			"flex-col",
			"sm:flex-row",
			"sm:gap-6",
			"gap-0",
			"items-stretch",
			"overflow-hidden",
		);

		const avatarContainer = document.createElement("div");
		const avatar = document.createElement("img");
		avatar.src = "/static-files/images/homer.png";
		avatar.classList.add(
			"h-full",
			"object-cover",
			"rounded-t-xl",
			"sm:rounded-t-none",
			"sm:rounded-l-xl",
			"sm:w-100",
		);
		avatarContainer.append(avatar);

		const article = document.createElement("article");
		article.classList.add(
			"grid",
			"[grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]",
			"gap-4",
			"p-6",
			"items-center",
			"self-center",
			"w-full",
		);

		// USERNAME
		const usernameContainer = document.createElement("div");
		const name = document.createElement("div");
		name.innerText = this.userData.username;
		name.classList.add("pong-heading");
		const nameLabel = document.createElement("div");
		nameLabel.innerText = "User Name";
		nameLabel.classList.add("pong-label");
		usernameContainer.append(nameLabel, name);

		// NICKNAME
		const nicknameContainer = document.createElement("div");
		const nickname = document.createElement("div");
		nickname.innerText = this.userData.nickname;
		nickname.classList.add("pong-heading");
		const nicknameLabel = document.createElement("div");
		nicknameLabel.innerText = "Nickname";
		nicknameLabel.classList.add("pong-label");
		nicknameContainer.append(nicknameLabel, nickname);

		// EMAIL
		const emailContainer = document.createElement("div");
		const email = document.createElement("div");
		email.innerText = this.userData.email;
		email.classList.add("pong-heading");
		const emailLabel = document.createElement("div");
		emailLabel.innerText = "Email";
		emailLabel.classList.add("pong-label");
		emailContainer.append(emailLabel, email);
		article.append(usernameContainer, nicknameContainer, emailContainer);

		this.append(avatarContainer, article);
	}

	disconnectedCallback() {}
}

customElements.define("profile-detail-component", ProfileDetailComponent);

export { ProfileDetailComponent };
