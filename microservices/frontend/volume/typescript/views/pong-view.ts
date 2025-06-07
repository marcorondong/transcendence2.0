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

	playAIButton = document.createElement("button");

	connectedCallback() {
		console.log("PONG VIEW has been CONNECTED");

		const container = document.createElement("container-for-view");
		this.append(container);
		const pongComponent = new PongComponent(this.chat);
		container.appendChild(pongComponent);
		pongComponent.classList.add("self-center");

		// Add Play Against AI button
		this.playAIButton.innerText = "Play Against AI";
		this.playAIButton.classList.add(
			"pong-button",
			"pong-button-info",
			"mt-4",
			"self-center",
		);
		container.appendChild(this.playAIButton);

		// Add click event listener
		this.playAIButton.addEventListener(
			"click",
			this.handlePlayAI.bind(this),
		);
	}

	async handlePlayAI() {
		try {
			const roomId = this.chat.roomId;
			const response = await fetch(
				`https://${window.location.hostname}:${window.location.port}/ai-api/game-mandatory`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						difficulty: "normal",
						roomId: roomId,
					}),
				},
			);

			if (response.ok) {
				console.log("Game started successfully");
			} else {
				console.error(
					"Failed to start game: ",
					response.status,
					" ",
					response.body,
				);
			}
		} catch (error) {
			console.error("Error starting game:", error);
		}
	}

	disconnectedCallback() {
		console.log("PONG VIEW has been DISCONNECTED");
	}
}

customElements.define("pong-view", PongView);

export function createComponent(chat: ChatComponent) {
	return new PongView(chat);
}
