import { IconComponent } from "../components/icon-component.js";
import "../components/pong-component.js";

class HomeView extends HTMLElement {
	constructor() {
		super();
	}
	button = document.createElement("button");
	buttonVerify = document.createElement("button");

	connectedCallback() {
		this.classList.add("flex", "flex-col", "items-start", "gap-8");
		console.log("HOME VIEW has been CONNECTED");

		// GAMES TO PICK
		const gamesContainer = document.createElement("div");
		gamesContainer.classList.add(
			"w-full",
			"flex",
			"justify-center",
			"gap-x-24",
			"gap-y-10",
			"pong-card",
			"flex-wrap",
		);

		const heading = document.createElement("div");
		heading.classList.add(
			"grow",
			"w-full",
			"flex",
			"gap-4",
			"bg-cyan-500/50",
			"rounded-t-xl",
			"px-8",
			"py-4",
		);
		const h1 = document.createElement("h2");
		h1.classList.add("pong-heading", "text-3xl");
		h1.textContent = "Pick a game";
		const gameIcon = new IconComponent("game", 10);
		heading.append(gameIcon, h1);

		const pongContainer = document.createElement("div");
		pongContainer.classList.add(
			"rounded-2xl",
			"bg-indigo-950",
			"p-5",
			"inset-shadow-sm",
			"inset-shadow-stone-950/50",
		);
		const pong = document.createElement("div");
		const pongLabel = document.createElement("div");
		pongLabel.classList.add(
			"pong-heading",
			"text-center",
			"mt-6",
			"text-xl",
		);
		pongLabel.innerText = "Pong";
		pong.classList.add(
			"p-3",
			"border-4",
			"rounded-lg",
			"bg-indigo-950",
			"border-cyan-400",
			"glow-small-hover",
			"cursor-pointer",
		);
		const pongImage = document.createElement("img");
		pongImage.src = "/static-files/images/pong.png";
		pongImage.width = 200;
		pongImage.classList.add("rounded-lg");
		pong.append(pongImage);
		pongContainer.append(pong, pongLabel);

		const tttContainer = document.createElement("div");
		tttContainer.classList.add(
			"rounded-2xl",
			"bg-indigo-950",
			"p-5",
			"inset-shadow-sm",
			"inset-shadow-stone-950/50",
		);
		const ttt = document.createElement("div");
		const tttLabel = document.createElement("div");
		tttLabel.classList.add(
			"pong-heading",
			"text-center",
			"mt-6",
			"text-xl",
		);
		tttLabel.innerText = "Tic-Tac-Toe";
		ttt.classList.add(
			"p-3",
			"border-4",
			"rounded-lg",
			"bg-indigo-950",
			"border-cyan-400",
			"glow-small-hover",
			"cursor-pointer",
		);
		const tttImage = document.createElement("img");
		tttImage.src = "/static-files/images/ttt.png";
		tttImage.width = 200;
		tttImage.classList.add("rounded-lg");
		ttt.append(tttImage);
		tttContainer.append(ttt, tttLabel);

		gamesContainer.append(heading, pongContainer, tttContainer);

		const matchTypeContainer = document.createElement("div");
		matchTypeContainer.classList.add(
			"w-full",
			"flex",
			"justify-center",
			"gap-x-24",
			"gap-y-10",
			"pong-card",
			"p-12",
			"flex-wrap",
		);

		const matchTypeHeading = document.createElement("div");
		matchTypeHeading.classList.add("grow", "w-full", "flex", "gap-4");
		const matchTypeH1 = document.createElement("h2");
		matchTypeH1.classList.add("pong-heading", "text-3xl");
		matchTypeH1.textContent = "Pick a Match Type";
		const matchTypeIcon = new IconComponent("list", 10);
		matchTypeHeading.append(matchTypeIcon, matchTypeH1);

		matchTypeContainer.append(matchTypeHeading);

		this.append(gamesContainer, matchTypeContainer);
	}

	disconnectedCallback() {
		console.log("HOME VIEW has been DISCONNECTED");
	}
}

customElements.define("home-view", HomeView);

export function createComponent() {
	return document.createElement("home-view");
}
