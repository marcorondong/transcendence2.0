import { GameData } from "../types/Game.js";
import { IconComponent } from "./icon-component.js";

class MenuSelectionComponent extends HTMLElement {
	gameData: GameData;

	constructor(gameData: GameData) {
		super();
		this.gameData = gameData;
	}

	async connectedCallback() {
		this.classList.add("flex-row", "gap-4", "px-4", "py-2", "items-center");

		const menuItems = this.gameData.menu;
		for (let i = 0; i < menuItems.length; ++i) {
			const button = document.createElement("button");
			button.classList.add("pong-menu", "flex", "gap-1", "menu-button");
			button.id = menuItems[i].icon;

			const label = document.createElement("div");
			label.textContent = menuItems[i].label;

			const icon = new IconComponent(menuItems[i].icon, 6);

			button.append(icon, label);

			this.append(button);
			if (i + 1 < menuItems.length) {
				const arrow = new IconComponent("arrow_right", 4);
				arrow.classList.add("text-cyan-300");
				this.append(arrow);
			}
		}
	}

	disconnectedCallback() {}
}

customElements.define("menu-selection-component", MenuSelectionComponent);

export { MenuSelectionComponent };
