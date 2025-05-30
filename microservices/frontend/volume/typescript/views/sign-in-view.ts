import { ChatComponent } from "../components/chat-component.js";
import {
	homeLinkEvent,
	notificationEvent,
	signUpLinkEvent,
} from "../services/events.js";
import { FetchAuth, UserAuth } from "../services/fetch-auth.js";

export class SignInView extends HTMLElement {
	chat: ChatComponent;

	constructor(chat: ChatComponent) {
		super();
		this.chat = chat;
	}

	frame = document.createElement("div");
	container = document.createElement("form");

	// SIGN IN
	heading = document.createElement("h1");
	labelUsername = document.createElement("label");
	inputUsername = document.createElement("input");
	labelPassword = document.createElement("label");
	inputPassword = document.createElement("input");
	signUpNote = document.createElement("div");
	signUpLink = document.createElement("a");
	signInButton = document.createElement("button");

	connectedCallback() {
		console.log("SIGN-IN VIEW has been CONNECTED");
		this.classList.add("flex", "w-full", "items-center", "justify-center");
		this.container.classList.add(
			"flex",
			"flex-col",
			"items-center",
			"w-120",
			"py-12",
			"px-12",
			"pong-card",
			"items-stretch",
			"shadow-xl",
			"gap-6",
		);
		this.heading.classList.add("pong-form-heading");
		this.heading.innerText = "Sign in to your account";
		this.inputUsername.id = "input-username";
		this.inputUsername.classList.add("pong-form-input", "block", "w-full");
		this.inputUsername.placeholder = "username";
		this.labelUsername.innerText = "Your Username";
		this.labelUsername.classList.add("pong-form-label");
		this.labelUsername.htmlFor = "input-username";
		this.labelUsername.append(this.inputUsername);
		this.inputPassword.placeholder = "••••••••";
		this.inputPassword.id = "input-password";
		this.inputPassword.type = "password";
		this.inputPassword.classList.add("pong-form-input", "block", "w-full");
		this.labelPassword.innerText = "Your Password";
		this.labelPassword.classList.add("pong-form-label");
		this.labelPassword.htmlFor = "input-password";
		this.labelPassword.append(this.inputPassword);
		this.signUpNote.innerText = "Don’t have an account yet? ";
		this.signUpLink.innerText = "Sign up";
		this.signUpLink.href = "#";
		this.signUpLink.id = "sign-up-link";
		this.signUpNote.append(this.signUpLink);
		this.signUpNote.classList.add("text-sm");
		this.signInButton.innerText = "Sign in";
		this.signInButton.classList.add("pong-button", "pong-button-info");
		this.signInButton.classList.add("mt-2");
		this.signInButton.id = "sign-in-button";
		this.container.append(
			this.heading,
			this.labelUsername,
			this.labelPassword,
			this.signInButton,
			this.signUpNote,
		);
		this.append(this.container);
		this.addEventListener("click", this);
	}
	handleEvent(event: Event) {
		const handlerName =
			"on" + event.type.charAt(0).toUpperCase() + event.type.slice(1);
		const handler = this[handlerName as keyof this];
		if (typeof handler === "function") {
			handler.call(this, event);
		}
	}

	async onClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target) {
			return;
		}
		if (target.id === "sign-up-link") {
			event.preventDefault();
			this.dispatchEvent(signUpLinkEvent);
		}
		if (target.id === "sign-in-button") {
			event.preventDefault();
			const user: UserAuth = {
				username: this.inputUsername.value,
				password: this.inputPassword.value,
			};
			const returnValue = await FetchAuth.signIn(user);
			if (returnValue && returnValue.response.ok) {
				this.chat.openWebsocket();
				this.dispatchEvent(homeLinkEvent);
			}
		}
	}

	disconnectedCallback() {
		console.log("LOGIN VIEW has been DISCONNECTED");
		this.removeEventListener("click", this.onClick);
	}
}

customElements.define("sign-in-view", SignInView);

export function createComponent(chat: ChatComponent) {
	return new SignInView(chat);
}
