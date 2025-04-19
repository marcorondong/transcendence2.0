import "../components/pong-component.js";

class HomeView extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		console.log("HOME VIEW has been CONNECTED");
		const h1 = document.createElement("h1");
		h1.className =
			"mb-4 font-bold leading-none text-gray-900 text-3xl dark:text-gray-200";
		h1.textContent = "Home";
		this.appendChild(h1);

		const pongComponent = document.createElement("pong-component");
		this.appendChild(pongComponent);
	}

	disconnectedCallback() {
		console.log("HOME VIEW has been DISCONNECTED");
	}
}

customElements.define("home-view", HomeView);

export function createComponent() {
	return document.createElement("home-view");
}
