import { GameSelectionComponent } from "../components/game-selection-component.js";
import { MenuSelectionComponent } from "../components/menu-selection-component.js";
import { ModeSelectionComponent } from "../components/mode-selection-component.js";
import { PlaySelectionComponent } from "../components/play-selection-component.js";

export interface SelectionState {
	menuSelection: "game" | "mode" | "play";
	gameSelection: undefined | "pong" | "ttt";
	modeSelection: undefined | string;
	playSelection: undefined | string;
}
export interface Menu {
	icon: string;
	label: string;
}

export interface GameData {
	menuItems: Menu[];
	gameOptions: string[];
	modeOptions: string[];
	playOptionsSingle: string[];
	playOptionsTournament: string[];
	selectionState: SelectionState;
}

class HomeView extends HTMLElement {
	constructor() {
		super();
	}
	// GAME STATE
	selectionSate: SelectionState = {
		menuSelection: "game",
		gameSelection: undefined,
		modeSelection: undefined,
		playSelection: undefined,
	};
	gameData: GameData = {
		menuItems: [
			{ icon: "game", label: "Pick a Game" },
			{ icon: "mode", label: "Select Mode" },
			{ icon: "rocket", label: "Let's Play" },
		],
		gameOptions: ["pong", "ttt"],
		modeOptions: [
			"Single Player Mode",
			"Doubles Mode",
			"Tournament Mode",
			"Spectator Mode",
		],
		playOptionsSingle: ["Play Random Opponent", "Play Friend"],
		playOptionsTournament: [
			"4 Player Tournament",
			"8 Player Tournament",
			"16 Player Tournament",
		],
		selectionState: this.selectionSate,
	};

	contentStyles: string[] = [
		"pong-card",
		"flex",
		"justify-center",
		"max-w-3xl",
	];
	gameContent: HTMLElement = new GameSelectionComponent(this.gameData);
	modeContent: HTMLElement = new ModeSelectionComponent(this.gameData);
	playContent: HTMLElement = new PlaySelectionComponent(this.gameData);
	menuContent: HTMLElement = new MenuSelectionComponent(this.gameData);

	updateMenuButtons() {
		const menuButtons = [...document.querySelectorAll(".menu-button")];
		if (!menuButtons) {
			return;
		}

		menuButtons.forEach((b) => b.classList.remove("pong-menu-active"));

		const firstButton = menuButtons.find(
			(b) => b.id === this.gameData.menuItems[0].icon,
		);
		if (firstButton) {
			if (this.gameData.selectionState.menuSelection === "game") {
				firstButton.classList.add("pong-menu-active");
			}
		}

		const secondButton = menuButtons.find(
			(b) => b.id === this.gameData.menuItems[1].icon,
		);
		if (secondButton) {
			if (!this.gameData.selectionState.gameSelection) {
				secondButton.setAttribute("disabled", "true");
			} else {
				secondButton.removeAttribute("disabled");
			}
			if (this.gameData.selectionState.menuSelection === "mode") {
				secondButton.classList.add("pong-menu-active");
			}
		}
		const thirdButton = menuButtons.find(
			(b) => b.id === this.gameData.menuItems[2].icon,
		);
		if (thirdButton) {
			if (!this.gameData.selectionState.modeSelection) {
				thirdButton.setAttribute("disabled", "true");
			} else {
				thirdButton.removeAttribute("disabled");
			}
			if (this.gameData.selectionState.menuSelection === "play") {
				thirdButton.classList.add("pong-menu-active");
			}
		}
	}
	updateContent() {
		const firstChild = this.firstChild;
		console.log("replacing this content:", firstChild);
		if (firstChild) {
			switch (this.gameData.selectionState.menuSelection) {
				case "game":
					console.log("switching to game");
					this.replaceChild(this.gameContent, firstChild);
					break;
				case "mode":
					console.log("switching to mode");
					this.replaceChild(this.modeContent, firstChild);
					break;
				case "play":
					console.log("switching to play");
					this.replaceChild(this.playContent, firstChild);
			}
		}
	}

	handleEvent(event: Event) {
		const handlerName =
			"on" + event.type.charAt(0).toUpperCase() + event.type.slice(1);
		const handler = this[handlerName as keyof this];
		if (typeof handler === "function") {
			handler.call(this, event);
		}
	}
	onClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target) {
			return;
		}

		// HANDLE ALL BUTTONS
		const button = target.closest("button");
		if (button) {
			this.handleMenuButtons(button);
			this.handleGameButtons(button);
		}
	}

	handleMenuButtons(button: HTMLButtonElement) {
		if (button.classList.contains("menu-button")) {
			console.log("menuButton pressed with id:", button.id);
			switch (button.id) {
				case "game":
					this.gameData.selectionState.menuSelection = "game";
					break;
				case "mode":
					this.gameData.selectionState.menuSelection = "mode";
					break;
				case "play":
					this.gameData.selectionState.menuSelection = "play";
			}
			this.updateMenuButtons();
			this.updateContent();
		}
	}

	handleGameButtons(button: HTMLButtonElement) {
		if (!button.classList.contains("game-button")) {
			return;
		}
		if (button.id === "pong") {
			this.gameData.selectionState.gameSelection = "pong";
		}
		if (button.id === "ttt") {
			this.gameData.selectionState.gameSelection = "ttt";
		}
		this.gameData.selectionState.menuSelection = "mode";
		this.updateMenuButtons();
		this.updateContent();
	}

	connectedCallback() {
		this.classList.add(
			"flex",
			"gap-2",
			"py-1",
			"justify-center",
			"flex-wrap",
		);
		this.gameContent.classList.add(...this.contentStyles, "grow-1");
		this.modeContent.classList.add(
			...this.contentStyles,
			"grow-1",
			"w-full",
		);
		this.playContent.classList.add(
			...this.contentStyles,
			"grow-1",
			"w-full",
		);
		this.menuContent.classList.add(...this.contentStyles);
		this.append(this.gameContent, this.menuContent);
		this.addEventListener("click", this);
		this.updateMenuButtons();
		console.log("HOME VIEW has been CONNECTED");
	}

	disconnectedCallback() {
		console.log("HOME VIEW has been DISCONNECTED");
	}
}

customElements.define("home-view", HomeView);

export function createComponent() {
	return document.createElement("home-view");
}
