import { GameData } from "../views/home-view.js";

class GameSelectionComponent extends HTMLElement {
	gameData: GameData;
	h1: HTMLElement | null = null;
	constructor(gameData: GameData) {
		super();
		this.gameData = gameData;
	}

	connectedCallback() {
		if (this.h1) {
			return;
		}
		this.classList.add(
			"gap-x-18",
			"gap-y-8",
			"px-18",
			"pb-16",
			"py-8",
			"flex-wrap",
		);
		const gameContainerStyles = ["rounded-2xl", "bg-indigo-950", "p-5"];
		const gameStyles = [
			"p-3",
			"border-4",
			"rounded-lg",
			"bg-indigo-950",
			"border-cyan-400",
			"glow-small-hover",
			"cursor-pointer",
			"game-button",
		];

		// headline
		this.h1 = document.createElement("h1");
		this.h1.innerText = "Pick a Game";
		this.h1.classList.add(
			"pong-heading",
			"pong-heading-big",
			"grow-1",
			"w-full",
			"text-center",
		);

		// PONG GAME
		const pongContainer = document.createElement("div");
		pongContainer.classList.add(...gameContainerStyles);
		const pong = document.createElement("button");
		pong.id = "pong";
		pong.classList.add(...gameStyles);
		const pongImage = document.createElement("img");
		pongImage.src = "/static-files/images/pong.png";
		pongImage.width = 200;
		pongImage.classList.add("rounded-lg");
		pong.append(pongImage);
		pongContainer.append(pong);

		// TIC TAC TOE GAME
		const tttContainer = document.createElement("div");
		tttContainer.classList.add(...gameContainerStyles);
		const ttt = document.createElement("button");
		ttt.id = "ttt";
		ttt.classList.add(...gameStyles);
		const tttImage = document.createElement("img");
		tttImage.src = "/static-files/images/ttt.png";
		tttImage.width = 200;
		tttImage.classList.add("rounded-lg");
		ttt.append(tttImage);
		tttContainer.append(ttt);

		this.append(this.h1, pongContainer, tttContainer);
	}

	disconnectedCallback() {}
}

customElements.define("game-selection-component", GameSelectionComponent);

export { GameSelectionComponent };
