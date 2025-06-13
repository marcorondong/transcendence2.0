import { FetchUsers } from "../services/fetch-users.js";
import { User } from "../types/User.js";
import { IconComponent } from "./icon-component.js";

class ProfileDetailComponent extends HTMLElement {
	userData: User;
	article = document.createElement("article");

	usernameContainer = document.createElement("div");
	username = document.createElement("div");
	usernameInput = document.createElement("input");

	nicknameContainer = document.createElement("div");
	nickname = document.createElement("div");
	nicknameInput = document.createElement("input");

	emailContainer = document.createElement("div");
	email = document.createElement("div");
	emailInput = document.createElement("input");

	passwordContainer = document.createElement("div");
	passwordInput = document.createElement("input");

	editButton = document.createElement("button");
	cancelSaveContainer = document.createElement("div");

	constructor(userData: User) {
		super();
		this.userData = userData;
		this.buildDomElements();
	}

	connectedCallback() {
		this.addEventListener("click", this);
	}

	disconnectedCallback() {
		this.removeEventListener("click", this);
	}

	displayDetail() {
		this.article.replaceChildren();
		this.cancelSaveContainer.remove();
		this.nicknameInput.remove();
		this.passwordContainer.remove();
		this.emailInput.remove();
		this.usernameContainer.append(this.username);
		this.nicknameContainer.append(this.nickname);
		this.emailContainer.append(this.email);
		this.article.append(
			this.usernameContainer,
			this.nicknameContainer,
			this.emailContainer,
			this.editButton,
		);
	}

	displayDetailInput() {
		this.article.replaceChildren();
		this.nickname.remove();
		this.email.remove();
		this.nicknameContainer.append(this.nicknameInput);
		this.emailContainer.append(this.emailInput);
		this.editButton.remove();
		this.article.append(
			this.nicknameContainer,
			this.passwordContainer,
			this.emailContainer,
			this.cancelSaveContainer,
		);
	}

	async putDetail() {
		console.log("PUTTING");
		try {
			const returnedData = await FetchUsers.userPut(this.userData.id, {
				email: this.emailInput.value,
				password: this.passwordInput.value,
				nickname: this.nicknameInput.value,
			});
			if (returnedData) {
				this.userData = { ...this.userData, ...returnedData };
				this.applyUserData();
				this.displayDetail();
			}
		} catch (e) {
			console.log(e);
		}
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
			this.handleEditButton(button);
			this.handleCancelButton(button);
			this.handleSaveButton(button);
		}
	}

	handleEditButton(button: HTMLButtonElement) {
		if (button.id !== "editButton") {
			return;
		}

		this.displayDetailInput();
	}

	handleSaveButton(button: HTMLElement) {
		if (button.id !== "saveButton") {
			return;
		}

		this.putDetail();
	}

	handleCancelButton(button: HTMLElement) {
		if (button.id !== "cancelButton") {
			return;
		}

		this.displayDetail();
	}

	applyUserData() {
		this.username.innerText = this.userData.username;
		this.nickname.innerText = this.userData.nickname;
		this.email.innerText = this.userData.email;
	}

	buildDomElements() {
		this.classList.add(
			"pong-card",
			"flex",
			"flex-col",
			"sm:flex-row",
			"items-stretch",
			"overflow-hidden",
		);

		const editIcon = new IconComponent("pencil", 4);
		this.editButton.id = "editButton";
		this.editButton.classList.add(
			"pong-button",
			"pong-button-primary",
			"pong-button-round",
			"p-2",
			"rounded-xl",
			"cursor-pointer",
			"self-end",
		);
		this.editButton.append(editIcon);

		const cancelButton = document.createElement("button");
		cancelButton.id = "cancelButton";
		cancelButton.classList.add(
			"pong-button",
			"pong-button-primary",
			"rounded-xl",
			"cursor-pointer",
		);
		cancelButton.innerText = "cancel";

		const uploadButton = document.createElement("button");
		uploadButton.id = "uploadButton";
		uploadButton.classList.add(
			"pong-button",
			"pong-button-primary",
			"rounded-xl",
			"cursor-pointer",
		);
		uploadButton.innerText = "upload avatar";

		const saveButton = document.createElement("button");
		saveButton.id = "saveButton";
		saveButton.classList.add(
			"pomg-button",
			"pong-button-primary",
			"px-3",
			"py-1",
			"rounded-xl",
			"cursor-pointer",
		);
		saveButton.innerText = "save";
		this.cancelSaveContainer.classList.add(
			"flex",
			"gap-3",
			"mt-2",
			"flex-wrap",
		);
		this.cancelSaveContainer.append(cancelButton, uploadButton, saveButton);

		// AVATAR
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

		// DETAIL INFORMATION
		this.article.classList.add(
			"flex",
			"gap-4",
			"px-9",
			"py-6",
			"flex-col",
			"items-stretch",
			"w-full",
		);
		const details = document.createElement("div");
		details.classList.add(
			"grid",
			"[grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]",
			"gap-4",
			"items-center",
			"self-center",
			"w-full",
		);

		// USERNAME
		this.username.classList.add("pong-heading");
		const usernameLabel = document.createElement("div");
		usernameLabel.innerText = "User Name";
		usernameLabel.classList.add("pong-form-label");
		this.usernameContainer.append(usernameLabel);

		// NICKNAME
		this.nickname.classList.add("pong-heading");
		const nicknameLabel = document.createElement("div");
		nicknameLabel.innerText = "Nickname";
		nicknameLabel.classList.add("pong-form-label");
		this.nicknameContainer.append(nicknameLabel, this.nickname);

		// PASSWORD
		const passwordLabel = document.createElement("div");
		passwordLabel.innerText = "Password";
		passwordLabel.classList.add("pong-form-label");
		this.passwordContainer.append(passwordLabel, this.passwordInput);

		// EMAIL
		this.email.classList.add("pong-heading");
		const emailLabel = document.createElement("div");
		emailLabel.innerText = "Email";
		emailLabel.classList.add("pong-form-label");
		this.emailContainer.append(emailLabel, this.email);
		details.append(
			this.usernameContainer,
			this.nicknameContainer,
			this.emailContainer,
		);
		this.applyUserData();
		this.article.append(this.editButton, details, this.cancelSaveContainer);

		this.append(avatarContainer, this.article);
		this.displayDetail();

		// ADD CLASSES AND PLACEHOLDERS
		this.passwordInput.classList.add("pong-form-input", "block", "w-full");
		this.passwordInput.placeholder = "••••••••";
		this.emailInput.classList.add("pong-form-input", "block", "w-full");
		this.emailInput.placeholder = this.email.innerText;
		this.nicknameInput.classList.add("pong-form-input", "block", "w-full");
		this.nicknameInput.placeholder = this.nickname.innerText;
	}
}

customElements.define("profile-detail-component", ProfileDetailComponent);

export { ProfileDetailComponent };
