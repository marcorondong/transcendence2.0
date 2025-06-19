import { ChatComponent } from "../components/chat-component";
import { GameSelectionComponent } from "../components/game-selection-component";
import { MenuSelectionComponent } from "../components/menu-selection-component";
import { ModeSelectionComponent } from "../components/mode-selection-component";
import { PlaySelectionComponent } from "../components/play-selection-component";
import { pongLinkEvent } from "../services/events";
import type { GameData, GameSelection } from "../types/Game";

class HomeView extends HTMLElement {
	chat: ChatComponent;
	constructor(chat: ChatComponent) {
		super();
		this.chat = chat;
	}

	// GAME STATE
	selection: GameSelection = {
		menu: "game",
		game: undefined,
		mode: undefined,
		room: undefined,
	};
	gameData: GameData = {
		menu: [
			{ icon: "game", label: "Pick a Game" },
			{ icon: "mode", label: "Select Mode" },
			{ icon: "play", label: "Let's Play" },
		],
		game: ["pong", "ttt"],
		mode: [
			{
				id: "singles",
				label: "Single Player Mode",
				play: [
					{ value: "public", label: "Play Random Opponent" },
					{ value: "private", label: "Play Friend" },
				],
			},
			{
				id: "doubles",
				label: "Doubles Mode",
				play: [{ value: "public", label: "Let's Play" }],
			},
			{
				id: "tournament",
				label: "Tournament Mode",
				play: [
					{ value: "4", label: "4 Player Tournament" },
					{ value: "8", label: "8 Player Tournament" },
					{ value: "16", label: "16 Player Tournament" },
				],
			},
			{
				id: "spectate",
				label: "Spectator Mode",
				play: [{ value: "input", label: "Start watching" }],
			},
		],
		selection: this.selection,
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
			(b) => b.id === this.gameData.menu[0].icon,
		);
		if (firstButton) {
			if (this.gameData.selection.menu === "game") {
				firstButton.classList.add("pong-menu-active");
			}
		}

		const secondButton = menuButtons.find(
			(b) => b.id === this.gameData.menu[1].icon,
		);
		if (secondButton) {
			if (!this.gameData.selection.game) {
				secondButton.setAttribute("disabled", "true");
			} else {
				secondButton.removeAttribute("disabled");
			}
			if (this.gameData.selection.menu === "mode") {
				secondButton.classList.add("pong-menu-active");
			}
		}
		const thirdButton = menuButtons.find(
			(b) => b.id === this.gameData.menu[2].icon,
		);
		if (thirdButton) {
			if (!this.gameData.selection.mode) {
				thirdButton.setAttribute("disabled", "true");
			} else {
				thirdButton.removeAttribute("disabled");
			}
			if (this.gameData.selection.menu === "play") {
				thirdButton.classList.add("pong-menu-active");
			}
		}
	}
	updateContent() {
		const firstChild = this.lastChild;
		if (firstChild) {
			switch (this.gameData.selection.menu) {
				case "game":
					this.replaceChild(this.gameContent, firstChild);
					break;
				case "mode":
					this.replaceChild(this.modeContent, firstChild);
					break;
				case "play":
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
			this.handleModeButtons(button);
			this.handlePlayButtons(button);
		}
	}

	handleMenuButtons(button: HTMLButtonElement) {
		if (button.classList.contains("menu-button")) {
			switch (button.id) {
				case "game":
					this.gameData.selection.menu = "game";
					break;
				case "mode":
					this.gameData.selection.menu = "mode";
					break;
				case "play":
					this.gameData.selection.menu = "play";
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
			this.gameData.selection.game = "pong";
		}
		if (button.id === "ttt") {
			this.gameData.selection.game = "ttt";
		}
		this.gameData.selection.menu = "mode";
		this.updateMenuButtons();
		this.updateContent();
	}

	handleModeButtons(button: HTMLButtonElement) {
		if (!button.classList.contains("mode-button")) {
			return;
		}
		const state = this.gameData.selection;
		state.mode = this.gameData.mode.find((m) => m.id === button.id)?.id;
		state.menu = "play";
		this.updateMenuButtons();
		this.updateContent();
	}

	handlePlayButtons(button: HTMLButtonElement) {
		if (!button.classList.contains("play-button")) {
			return;
		}
		this.gameData.selection.room = button.id;

		this.dispatchEvent(pongLinkEvent(this.gameData.selection));
	}

	connectedCallback() {
		this.classList.add("flex", "gap-4", "justify-center", "flex-wrap");
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
		this.append(this.menuContent, this.gameContent);
		this.addEventListener("click", this);
		this.updateMenuButtons();
		console.log("HOME VIEW has been CONNECTED");
	}

	disconnectedCallback() {
		console.log("HOME VIEW has been DISCONNECTED");
		document.removeEventListener("click", this, false);
	}
}

customElements.define("home-view", HomeView);

export function createComponent(chat: ChatComponent) {
	return new HomeView(chat);
}
