import "../components/pong-component.js";
import { notificationEvent } from "../services/events.js";
import { FetchAuth } from "../services/fetch-auth.js";

class HomeView extends HTMLElement {
	constructor() {
		super();
	}
	button = document.createElement("button");
	buttonVerify = document.createElement("button");

	connectedCallback() {
		this.classList.add("flex", "flex-col", "items-start");
		console.log("HOME VIEW has been CONNECTED");
		const h1 = document.createElement("h1");
		h1.className =
			"mb-4 font-bold leading-none text-gray-900 text-3xl dark:text-gray-200";
		h1.textContent = "Home";
		this.appendChild(h1);

		this.button.classList.add("pong-button");
		this.button.addEventListener("click", () => {
			this.button.dispatchEvent(notificationEvent("helloooo", "info"));
		});
		this.button.innerText = "notification";

		this.buttonVerify.classList.add("pong-button");
		this.buttonVerify.addEventListener("click", () =>
			FetchAuth.verifyJwt(),
		);
		this.buttonVerify.innerText = "verify token";

		this.append(this.button, this.buttonVerify);
	}

	disconnectedCallback() {
		console.log("HOME VIEW has been DISCONNECTED");
	}
}

customElements.define("home-view", HomeView);

export function createComponent() {
	return document.createElement("home-view");
}
