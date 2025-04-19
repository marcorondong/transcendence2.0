import {IconComponent} from "./icon-component.js";

export class ThemeToggleComponent extends HTMLElement {
	constructor() {
		super();
		this.initSystemMode();
	}

	initSystemMode() {
		if (
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches
		) {
			document.documentElement.setAttribute("data-theme", "dark");
			this.systemModeLight = false;
		} else {
			document.documentElement.setAttribute("data-theme", "light");
			this.systemModeLight = true;
		}
	}

	applySystemMode(icon: IconComponent) {
		if (icon.iconName === this.lightIconName) {
			if (this.systemModeLight) {
				icon.classList.remove("hidden");
				icon.classList.add("block");
			} else {
				icon.classList.remove("block");
				icon.classList.add("hidden");
			}
		} else {
			if (this.systemModeLight) {
				icon.classList.remove("block");
				icon.classList.add("hidden");
			} else {
				icon.classList.remove("hidden");
				icon.classList.add("block");
			}
		}
	}

	darkIconName = "moon";
	lightIconName = "sun";
	systemModeLight: boolean;
	darkIcon = new IconComponent();
	lightIcon = new IconComponent();
	iconSize: number = 5;
	button: HTMLElement;

	sizeFromAttribute() {
		const size = Number(this.getAttribute("size"));
		if (size) {
			this.iconSize = size;
		}
	}

	switchTheme() {}

	connectedCallback() {
		this.button = document.createElement("button");
		this.button.classList.add("cursor-pointer", "pong-button");
		this.append(this.button);
		this.darkIcon.setIcon(this.darkIconName);
		this.lightIcon.setIcon(this.lightIconName);
		this.sizeFromAttribute();
		this.darkIcon.setSize(this.iconSize);
		this.lightIcon.setSize(this.iconSize);
		this.applySystemMode(this.darkIcon);
		this.applySystemMode(this.lightIcon);
		this.button.append(this.darkIcon, this.lightIcon);
		this.button.addEventListener("click", () => {
			if (this.lightIcon.classList.contains("hidden")) {
				document.documentElement.setAttribute("data-theme", "light");
				this.lightIcon.classList.remove("hidden");
				this.lightIcon.classList.add("block");
				this.darkIcon.classList.remove("block");
				this.darkIcon.classList.add("hidden");
			} else {
				document.documentElement.setAttribute("data-theme", "dark");
				this.darkIcon.classList.remove("hidden");
				this.darkIcon.classList.add("block");
				this.lightIcon.classList.remove("block");
				this.lightIcon.classList.add("hidden");
			}
		});
	}

	disconnectedCallback() {}
}

export function createThemeToggleComponent(): ThemeToggleComponent {
	return document.createElement(
		"theme-toggle-component",
	) as ThemeToggleComponent;
}

customElements.define("theme-toggle-component", ThemeToggleComponent);
