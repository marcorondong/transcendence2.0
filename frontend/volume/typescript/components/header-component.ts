import { IconComponent } from "./icon-component.js";
import { ThemeToggleComponent } from "./theme-toggle-component.js";

export class HeaderComponent extends HTMLElement {
	menuIcon = new IconComponent();

	constructor() {
		super();
	}

	connectedCallback() {
		console.log("NAVIGATION CONNECTED");

		this.classList.add(
			"mb-9",
			"flex",
			"content-center",
			"justify-between",
			"py-9",
		);
		const logo = document.createElement("img");
		logo.classList.add("size-18", "rounded-lg");
		logo.src = "./static-files/images/pong-logo.png";
		this.appendChild(logo);

		const navigation = document.createElement("div");
		navigation.classList.add("flex", "items-center", "gap-4");

		const menuButton = document.createElement("button");
		menuButton.classList.add("pong-button", "sm:hidden");
		menuButton.id = "navbar-button";
		this.menuIcon.setSize(6);
		this.menuIcon.setIcon("menu");
		menuButton.appendChild(this.menuIcon);
		navigation.appendChild(menuButton);

		const list = document.getElementById("navigation");
		if (list) {
			list.classList.add(
				"top-30",
				"absolute",
				"inset-0",
				"flex",
				"hidden",
				"w-full",
				"flex-col",
				"items-stretch",
				"justify-start",
				"gap-4",
				"p-6",
				"sm:static",
				"sm:flex",
				"sm:w-auto",
				"sm:flex-row",
				"sm:content-center",
				"sm:items-center",
				"sm:p-0",
				"bg-gray-200",
				"sm:bg-transparent",
				"dark:bg-indigo-950",
				"dark:sm:bg-transparent",
			);
			navigation.appendChild(list);
		}

		const themeToggle = new ThemeToggleComponent();
		themeToggle.setSize(6);
		navigation.appendChild(themeToggle);

		this.appendChild(navigation);

		this.menuIcon.addEventListener("click", () => {
			if (list?.classList.contains("hidden")) {
				list?.classList.remove("hidden");
			} else {
				list?.classList.add("hidden");
			}
		});

		list?.addEventListener("click", () => {
			list?.classList.add("hidden");
		});
	}

	disconnectedCallback() {
		console.log("NAVIGATION DISCONNECTED");
	}
}

customElements.define("navigation-component", HeaderComponent);
