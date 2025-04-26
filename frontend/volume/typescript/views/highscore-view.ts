export class HighscoreView extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		console.log("HIGHSCORE VIEW has been CONNECTED");
		const h1 = document.createElement("h1");
		h1.textContent = "Highscore";
		this.appendChild(h1);
	}

	disconnectedCallback() {
		console.log("HIGHSCORE VIEW has been DISCONNECTED");
	}
}

customElements.define("highscore-view", HighscoreView);


export function createComponent() {
	return document.createElement("highscore-view");
}