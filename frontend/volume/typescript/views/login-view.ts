export class ProfileView extends HTMLElement {
	constructor() {
		super();
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

	//SIGN UP
	labelEmail = document.createElement("label");
	inputEmail = document.createElement("input");
	labelNickname = document.createElement("label");
	inputNickname = document.createElement("input");
	labelRePassword = document.createElement("label");
	inputRePassword = document.createElement("input");
	signUpButton = document.createElement("button");

	connectedCallback() {
		console.log("LOGIN VIEW has been CONNECTED");
		this.classList.add("flex", "w-full", "items-center", "justify-center");
		this.container.classList.add(
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
		this.container.append(
			this.heading,
			this.labelUsername,
			this.labelPassword,
			this.signInButton,
			this.signUpNote,
		);
		this.append(this.container);
		document.addEventListener("click", this);
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
		if (target.id === "sign-up-link") {
			event.preventDefault();
			this.renderSignUp();
		}
	}

	renderSignUp() {
		this.heading.innerText = "Create an account";

		this.inputEmail.classList.add("pong-form-input", "w-full", "block");
		this.labelEmail.classList.add("pong-form-label");
		this.inputEmail.type = "email";
		this.inputEmail.placeholder = "name@mail.com";
		this.inputEmail.id = "input-email";
		this.labelEmail.htmlFor = "input-email";
		this.labelEmail.innerText = "Your Email";
		this.labelEmail.append(this.inputEmail);

		this.inputNickname.classList.add("pong-form-input", "w-full", "block");
		this.labelNickname.classList.add("pong-form-label");
		this.labelNickname.innerText = "Your Nickname";
		this.labelNickname.htmlFor = "input-nickname";
		this.inputNickname.id = "input-nickname";
		this.inputNickname.placeholder = "nickname";
		this.labelNickname.append(this.inputNickname);

		this.inputRePassword.classList.add(
			"pong-form-input",
			"w-full",
			"block",
		);
		this.labelRePassword.classList.add("pong-form-label");
		this.inputRePassword.type = "password";
		this.inputRePassword.id = "input-re-password";
		this.labelRePassword.htmlFor = "input-re-password";
		this.inputRePassword.placeholder = "••••••••";
		this.labelRePassword.innerText = "Repeat Password";
		this.labelRePassword.append(this.inputRePassword);

		this.signUpButton.innerText = "Register new account";
		this.signUpButton.classList.add(
			"pong-button",
			"pong-button-info",
			"mt-2",
		);
		this.signInButton.remove();
		this.signUpNote.remove();

		this.container.append(
			this.labelRePassword,
			this.labelEmail,
			this.labelNickname,
			this.signUpButton,
		);
	}

	disconnectedCallback() {
		console.log("LOGIN VIEW has been DISCONNECTED");
	}
}

customElements.define("login-view", ProfileView);

export function createComponent() {
	return document.createElement("login-view");
}
