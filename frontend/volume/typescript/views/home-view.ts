import "../components/pong-component.js";

class HomeView extends HTMLElement {
	constructor() {
		super();
	}
	button = document.createElement("button");
	buttonVerify = document.createElement("button");

	connectedCallback() {
		this.classList.add("flex", "flex-col", "items-start");
		console.log("HOME VIEW has been CONNECTED");
		const h1 = document.createElement("h1");
		h1.className =
			"mb-4 font-bold leading-none text-gray-900 text-3xl dark:text-gray-200";
		h1.textContent = "Pick a game";

		// GAMES TO PICK
		const gamesContainer = document.createElement("div");
		gamesContainer.classList.add(
			"w-full",
			"flex",
			"justify-center",
			"gap-4",
		);
		const pong = document.createElement("div");
		pong.classList.add(
			"p-1",
			"sm:p-3",
			"xl:p-5",
			"mb-10",
			"sm:border-5",
			"xl:border-6",
			"border-3",
			"sm:rounded-xl",
			"rounded-lg",
			"bg-indigo-950",
			"border-cyan-300",
			"glow",
		);
		const pongImage = document.createElement("img");
		pongImage.src = "/static-files/images/pong.png";
		pongImage.width = 300;
		pong.append(pongImage);

		gamesContainer.append(pong);

		this.append(h1, gamesContainer);
	}

	disconnectedCallback() {
		console.log("HOME VIEW has been DISCONNECTED");
	}
}

customElements.define("home-view", HomeView);

export function createComponent() {
	return document.createElement("home-view");
}
