import { notificationEvent } from "../services/events";
import { baseUrl } from "../services/fetch";
import { FetchUsers } from "../services/fetch-users";
import {
	emailValidator,
	nicknameValidator,
	passwordValidator,
} from "../services/validation";
import type { User } from "../types/User";
import { IconComponent } from "./icon-component";
import * as v from "valibot";

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

	uploadLabel = document.createElement("label");
	uploadInput = document.createElement("input");

	passwordContainer = document.createElement("div");
	passwordInput = document.createElement("input");

	editButton = document.createElement("button");
	cancelSaveContainer = document.createElement("div");

	avatarContainer = document.createElement("div");
	avatar = document.createElement("img");

	constructor(userData: User) {
		super();
		this.userData = userData;
		this.buildDomElements();
	}

	connectedCallback() {
		this.addEventListener("click", this);
		this.addEventListener("submit", this);
	}

	disconnectedCallback() {
		this.removeEventListener("click", this);
		this.removeEventListener("submit", this);
	}

	displayDetail() {
		this.uploadLabel.remove();
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
		this.avatarContainer.append(this.uploadLabel);
	}

	async patchDetail() {
		try {
			const returnedAvatarData = await FetchUsers.userPutAvatar(
				this.userData.id,
			);
			if (returnedAvatarData) {
				this.userData = { ...this.userData, ...returnedAvatarData };
			}
			const returnedData = await FetchUsers.userPatch(this.userData.id, {
				email:
					this.emailInput.value === this.userData.email
						? undefined
						: v.parse(emailValidator, this.emailInput.value.trim()),
				password:
					this.passwordInput.value === ""
						? undefined
						: v.parse(passwordValidator, this.passwordInput.value),
				nickname:
					this.userData.nickname === this.nicknameInput.value
						? undefined
						: v.parse(
								nicknameValidator,
								this.nicknameInput.value.trim(),
							),
			});
			if (returnedData) {
				this.userData = { ...this.userData, ...returnedData };
			}
			this.applyUserData();
			this.displayDetail();
		} catch (e: any) {
			document.dispatchEvent(
				notificationEvent(String(e.message), "error"),
			);
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

	onSubmit(e: Event) {
		e.preventDefault();
		this.patchDetail();
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
			// this.handleDeleteButton(button);
		}
	}

	handleEditButton(button: HTMLButtonElement) {
		if (button.id !== "editButton") {
			return;
		}

		this.displayDetailInput();
	}

	handleCancelButton(button: HTMLElement) {
		if (button.id !== "cancelButton") {
			return;
		}

		this.displayDetail();
	}

	// async handleDeleteButton(button: HTMLElement) {
	// 	if (button.id !== "deleteButton") {
	// 		return;
	// 	}
	// 	try {
	// 		await FetchUsers.userDelete(this.userData.id);
	// 		await FetchAuth.signOut();
	// 	} catch (e) {
	// 		console.log(e);
	// 	}
	// }

	applyUserData() {
		this.username.innerText = this.userData.username;
		this.nickname.innerText = this.userData.nickname;
		this.email.innerText = this.userData.email;

		this.avatar.src = baseUrl + this.userData.picture;
	}

	buildDomElements() {
		const form = document.createElement("form");
		form.classList.add(
			"pong-card",
			"flex",
			"flex-col",
			"sm:flex-row",
			"items-stretch",
			"overflow-hidden",
		);

		const editIcon = new IconComponent("pencil", 5);
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

		const saveButton = document.createElement("button");
		saveButton.id = "saveButton";
		saveButton.classList.add(
			"pomg-button",
			"pong-button-info",
			"px-3",
			"py-1",
			"rounded-xl",
			"cursor-pointer",
		);
		saveButton.innerText = "save";
		saveButton.type = "submit";
		this.cancelSaveContainer.classList.add(
			"flex",
			"gap-3",
			"mt-2",
			"flex-wrap",
		);

		// const deleteButton = document.createElement("button");
		// deleteButton.id = "deleteButton";
		// deleteButton.classList.add(
		// 	"pomg-button",
		// 	"pong-button-error",
		// 	"px-3",
		// 	"py-1",
		// 	"rounded-xl",
		// 	"cursor-pointer",
		// );
		// deleteButton.innerText = "delete";
		// this.cancelSaveContainer.classList.add(
		// 	"flex",
		// 	"gap-3",
		// 	"mt-2",
		// 	"flex-wrap",
		// );

		this.cancelSaveContainer.append(cancelButton, saveButton);

		// AVATAR
		this.avatarContainer.classList.add("relative");
		// avatar.src = "/static-files/images/homer.png";
		this.avatar.src = this.userData.picture;
		this.avatar.classList.add(
			"h-full",
			"object-cover",
			"rounded-t-xl",
			"sm:rounded-t-none",
			"sm:rounded-l-xl",
			"sm:w-100",
		);
		this.avatarContainer.append(this.avatar);

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

		// UPLOAD AVATAR
		this.uploadInput.id = "uploadAvatar";
		this.uploadInput.accept = "image/*";
		this.uploadInput.type = "file";
		this.uploadInput.name = "picture";
		this.uploadInput.classList.add("hidden");
		this.uploadLabel.classList.add(
			"pong-button",
			"pong-button-pale",
			"pong-button-round",
			"absolute",
			"top-3",
			"left-3",
		);
		this.uploadLabel.id = "uploadLabel";
		const uploadIcon = new IconComponent("image", 5);

		this.uploadLabel.append(this.uploadInput, uploadIcon);

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

		form.append(this.avatarContainer, this.article);
		this.append(form);
		this.displayDetail();

		// ADD CLASSES AND PLACEHOLDERS
		this.passwordInput.classList.add("pong-form-input", "block", "w-full");
		this.passwordInput.placeholder = "••••••••";
		this.passwordInput.type = "password";
		this.emailInput.classList.add("pong-form-input", "block", "w-full");
		this.emailInput.value = this.email.innerText;
		this.emailInput.type = "email";
		this.nicknameInput.classList.add("pong-form-input", "block", "w-full");
		this.nicknameInput.value = this.nickname.innerText;
		this.uploadInput.classList.add(
			"pong-button",
			"pong-button-primary",
			"rounded-xl",
		);
	}
}

customElements.define("profile-detail-component", ProfileDetailComponent);

export { ProfileDetailComponent };
