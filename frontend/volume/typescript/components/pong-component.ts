export class PongComponent extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		console.log("Pong CONNECTED");
	}

	disconnectedCallback() {
		console.log("Pong DISCONNECTED");
	}
}

customElements.define("pong-component", PongComponent);

const queryParams = window.location.search;
const wss = new WebSocket(
	`wss://${window.location.hostname}:${window.location.port}/pong/${queryParams}`,
);

wss.onmessage = (event) => {
	console.log("got message");
	const gameState = JSON.parse(event.data);
	console.log("game State", gameState);
};
