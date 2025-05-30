import "../components/pong-component.js";
import "../components/container-for-view.js";
import { PongComponent } from "../components/pong-component.js";
import { ChatComponent } from "../components/chat-component.js";

class PongView extends HTMLElement {
	chat: ChatComponent;
	constructor(chat: ChatComponent) {
		super();
		this.chat = chat;
	}

	connectedCallback() {
		console.log("PONG VIEW has been CONNECTED");

		const container = document.createElement("container-for-view");
		this.append(container);
		const pongComponent = new PongComponent(this.chat);
		container.appendChild(pongComponent);
		pongComponent.classList.add("self-center");
	}

	disconnectedCallback() {
		console.log("PONG VIEW has been DISCONNECTED");
	}
}

customElements.define("pong-view", PongView);

export function createComponent(chat: ChatComponent) {
	return new PongView(chat);
}
