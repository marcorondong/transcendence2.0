import { IconComponent } from "./icon-component.js";
import { ThemeToggleComponent } from "./theme-toggle-component.js";

export class HeaderComponent extends HTMLElement {
	menuIcon = new IconComponent();

	constructor() {
		super();
	}

	connectedCallback() {
		console.log("Header CONNECTED");

		// this.classList.add("flex", "content-center", "justify-between", "py-9");
		const logoAnchor = document.createElement("a");
		logoAnchor.href = "/";
		const logo = document.createElement("img");
		logo.classList.add("size-18", "rounded-lg");
		logo.src = "/static-files/images/pong-logo.png";
		logoAnchor.appendChild(logo);
		this.appendChild(logoAnchor);

		const navigation = document.createElement("div");
		navigation.classList.add("flex", "items-center", "gap-4");

		const menuButton = document.createElement("button");
		menuButton.classList.add("pong-button", "sm:hidden");
		menuButton.id = "navbar-button";
		this.menuIcon.setSize(6);
		this.menuIcon.setIcon("menu");
		menuButton.appendChild(this.menuIcon);
		navigation.appendChild(menuButton);
		const closeButton = document.createElement("button");
		const closeIcon = new IconComponent("close", 6);
		closeButton.append(closeIcon);
		closeButton.classList.add(
			"absolute",
			"pong-button",
			"z-43",
			"right-6",
			"top-6",
			"hidden",
		);

		const list = document.getElementById("navigation");
		if (list) {
			list.classList.add(
				"fixed",
				"top-0",
				"right-0",
				"left-0",
				"bottom-0",
				"flex",
				"hidden",
				"w-full",
				"flex-col",
				"items-stretch",
				"justify-center",
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
				"z-42",
			);
			navigation.appendChild(list);

			this.appendChild(closeButton);
		}

		const themeToggle = new ThemeToggleComponent();
		themeToggle.setSize(6);
		navigation.appendChild(themeToggle);

		this.appendChild(navigation);

		this.menuIcon.addEventListener("click", () => {
			list?.classList.remove("hidden");
			closeButton.classList.remove("hidden");
		});

		closeButton.addEventListener("click", () => {
			list?.classList.add("hidden");
			closeButton.classList.add("hidden");
		});

		list?.addEventListener("click", () => {
			list?.classList.add("hidden");
			closeButton.classList.add("hidden");
		});
	}

	disconnectedCallback() {
		console.log("Header DISCONNECTED");
	}
}

customElements.define("header-component", HeaderComponent);
