import { IconComponent } from "../components/icon-component.js";
import "../components/pong-component.js";

class HomeView extends HTMLElement {
	constructor() {
		super();
	}
	button = document.createElement("button");
	buttonVerify = document.createElement("button");

	connectedCallback() {
		this.classList.add(
			"grid",
			"gap-[4rem]",
			"grid-cols-[repeat(auto-fit,minmax(400px,1fr))]",
			"grid-rows-[40rem]",
			"auto-rows-1fr",
		);
		console.log("HOME VIEW has been CONNECTED");

		// GAMES TO PICK
		const gamesContainer = document.createElement("div");

		const containerStyles = [
			"relative",
			"p-10",
			"flex",
			"justify-center",
			"gap-x-24",
			"gap-y-6",
			"pong-card",
			"pong-card-thick",
			"self-start",
		];
		const pillStyles = [
			"absolute",
			"-top-6",
			"left-10",
			"flex",
			"rounded-3xl",
			"gap-4",
			"px-2",
			"bg-indigo-900",
			"px-4",
			"py-2",
		];

		gamesContainer.classList.add(...containerStyles);

		const pill = document.createElement("div");
		pill.classList.add(...pillStyles);
		const h1 = document.createElement("h2");
		h1.classList.add("pong-heading", "text-xl");
		h1.textContent = "Pick a game";
		const gameIcon = new IconComponent("game", 8);
		pill.append(gameIcon, h1);

		const pongContainer = document.createElement("div");
		pongContainer.classList.add("rounded-2xl", "bg-indigo-950", "p-5");
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
		tttContainer.classList.add("rounded-2xl", "bg-indigo-950", "p-5");
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

		gamesContainer.append(pongContainer, tttContainer, pill);

		// MATCH TYPE
		const matchTypeContainer = document.createElement("div");
		matchTypeContainer.classList.add(...containerStyles);

		const matchTypeH1 = document.createElement("h2");
		matchTypeH1.classList.add("pong-heading", "text-xl");
		matchTypeH1.textContent = "Pick a Match Type";
		const matchTypeIcon = new IconComponent("list", 8);
		const matchPill = document.createElement("div");
		matchPill.classList.add(...pillStyles);
		matchPill.append(matchTypeIcon, matchTypeH1);

		// MATCH TYPE OPTIONS
		const optionsContainer = document.createElement("div");
		optionsContainer.classList.add(
			"flex-col",
			"flex",
			"gap-2",
			"w-full",
			"mx-12",
			"items-center",
			"rounded-2xl",
			"bg-indigo-950",
			"p-5",
		);

		const optionSingles = document.createElement("div");
		optionSingles.innerText = "Single Player Mode";
		const optionDoubles = document.createElement("div");
		optionDoubles.innerText = "Doubles Mode";
		const optionTournament = document.createElement("div");
		optionTournament.innerText = "Tournament Mode";
		const optionSpectator = document.createElement("div");
		optionSpectator.innerText = "Spectator Mode";
		optionsContainer.append(
			optionSingles,
			optionDoubles,
			optionTournament,
			optionSpectator,
		);

		matchTypeContainer.append(optionsContainer, matchPill);

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
