import "../components/pong-component.js";
import "../components/container-for-view.js";

class HomeView extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		console.log("PONG VIEW has been CONNECTED");

		const container = document.createElement("container-for-view");
		this.append(container);
		const pongComponent = document.createElement("pong-component");
		container.appendChild(pongComponent);
		pongComponent.classList.add("self-center");
	}

	disconnectedCallback() {
		console.log("PONG VIEW has been DISCONNECTED");
	}
}

customElements.define("pong-view", HomeView);

export function createComponent() {
	return document.createElement("pong-view");
}
