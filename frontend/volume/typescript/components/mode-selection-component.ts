import { GameData } from "../views/home-view.js";

class ModeSelectionComponent extends HTMLElement {
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
		console.log("RUNNING CONNECTED CALLBACK MODE");
		//MATCH TYPE
		this.classList.add("flex", "flex-col", "items-center", "gap-8", "p-8");

		this.h1 = document.createElement("h1");
		this.h1.classList.add("pong-heading", "pong-heading-big");
		this.h1.textContent = "Select a Match Mode";

		// MATCH TYPE OPTIONS
		const optionsContainer = document.createElement("div");
		optionsContainer.classList.add(
			"flex-col",
			"flex",
			"gap-1",
			"w-full",
			"mx-12",
			"items-center",
			"rounded-2xl",
			"bg-indigo-950",
		);

		this.gameData.modeOptions.forEach((m) => {
			const button = document.createElement("button");
			button.innerText = m;
			button.id = m.split(" ")[0];
			button.classList.add(
				"hover:bg-slate-200/10",
				"p-3",
				"self-stretch",
				"rounded-2xl",
				"cursor-pointer",
				"mode-button",
			);
			optionsContainer.append(button);
		});
		this.append(this.h1, optionsContainer);
	}

	disconnectedCallback() {}
}

customElements.define("mode-selection-component", ModeSelectionComponent);

export { ModeSelectionComponent };
