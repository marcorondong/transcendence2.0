import "../components/pong-component.js";
import { notificationEvent } from "../services/events.js";

class HomeView extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.classList.add("flex", "flex-col", "items-start");
		console.log("HOME VIEW has been CONNECTED");
		const h1 = document.createElement("h1");
		h1.className =
			"mb-4 font-bold leading-none text-gray-900 text-3xl dark:text-gray-200";
		h1.textContent = "Home";
		this.appendChild(h1);

		const button = document.createElement("button");
		button.classList.add("pong-button");
		button.addEventListener("click", () => {
			button.dispatchEvent(notificationEvent("helloooo", "info"));
		});
		button.innerText = "press me";
		this.append(button);
	}

	disconnectedCallback() {
		console.log("HOME VIEW has been DISCONNECTED");
	}
}

customElements.define("home-view", HomeView);

export function createComponent() {
	return document.createElement("home-view");
}
