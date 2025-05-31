import { GameData } from "../views/home-view.js";
import { IconComponent } from "./icon-component.js";

class PlaySelectionComponent extends HTMLElement {
	gameData: GameData;
	h1: HTMLElement | null = null;
	constructor(gameData: GameData) {
		super();
		this.gameData = gameData;
	}

	connectedCallback() {
		this.replaceChildren();
		const playOptions = this.gameData.modeOptions.find(
			(m) => this.gameData.selectionState.modeSelection === m.id,
		);
		this.classList.add("flex", "flex-col", "items-center", "gap-8", "p-8");

		// // headline
		// this.h1 = document.createElement("h1");
		// this.h1.innerText = "Let's Play";
		// this.h1.classList.add(
		// 	"pong-heading",
		// 	"pong-heading-big",
		// 	"pong-heading-indigo",
		// );
		// const header = document.createElement("div");
		// const icon = new IconComponent("play", 10);
		// header.append(icon, this.h1);
		// header.classList.add(
		// 	"w-full",
		// 	"grow-1",
		// 	"flex",
		// 	"gap-2",
		// 	"justify-center",
		// 	"items-center",
		// 	"text-slate-200/70",
		// );

		// PLAY OPTIONS
		const optionsContainer = document.createElement("div");
		optionsContainer.classList.add(
			"flex-col",
			"flex",
			"gap-1",
			"p-1",
			"w-full",
			"mx-12",
			"items-center",
			"rounded-2xl",
			"bg-indigo-950",
		);

		console.log("play options: ", playOptions);

		if (!playOptions) {
			return;
		}

		playOptions.play.forEach((m) => {
			const button = document.createElement("button");
			button.innerText = m.label;
			button.id = m.value;
			button.classList.add(
				"pong-button",
				"pong-button-info",
				"self-stretch",
				"play-button",
			);
			optionsContainer.append(button);
		});
		this.append(optionsContainer);
	}

	disconnectedCallback() {}
}

customElements.define("play-selection-component", PlaySelectionComponent);

export { PlaySelectionComponent };
