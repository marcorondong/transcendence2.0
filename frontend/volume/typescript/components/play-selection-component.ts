import { GameData } from "../views/home-view.js";

class PlaySelectionComponent extends HTMLElement {
	gameData: GameData;
	h1: HTMLElement | null = null;
	constructor(gameData: GameData) {
		super();
		this.gameData = gameData;
	}

	async connectedCallback() {
		if (this.h1) {
			return;
		}
		this.h1 = document.createElement("h1");
		this.h1.classList.add("pong-heading", "pong-heading-big");
		this.h1.textContent = "Let's Play";
		this.append(this.h1);
	}

	disconnectedCallback() {}
}

customElements.define("play-selection-component", PlaySelectionComponent);

export { PlaySelectionComponent };
