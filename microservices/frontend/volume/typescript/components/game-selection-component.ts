import { GameData } from "../views/home-view.js";
import { IconComponent } from "./icon-component.js";

class GameSelectionComponent extends HTMLElement {
	gameData: GameData;
	h1: HTMLElement | null = null;
	constructor(gameData: GameData) {
		super();
		this.gameData = gameData;
	}

	connectedCallback() {
		this.replaceChildren();
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
			"pong-heading-indigo",
		);
		const header = document.createElement("div");
		const icon = new IconComponent("game", 10);
		header.append(icon, this.h1);
		header.classList.add(
			"w-full",
			"grow-1",
			"flex",
			"gap-2",
			"justify-center",
			"items-center",
			"text-slate-200/70",
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

		this.append(header, pongContainer, tttContainer);
	}

	disconnectedCallback() {}
}

customElements.define("game-selection-component", GameSelectionComponent);

export { GameSelectionComponent };
