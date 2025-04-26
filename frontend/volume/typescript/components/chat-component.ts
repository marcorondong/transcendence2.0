class ChatComponent extends HTMLElement {
	ws: WebSocket | undefined = undefined;

	constructor() {
		super();

		// const queryParams = window.location.search;
		this.ws = new WebSocket(
			`wss://${window.location.hostname}:${window.location.port}/ws`,
		);

		this.ws.onmessage = (event) => {
			const test = JSON.parse(event.data);
			if (test) {
				console.log("from Websocket", test);
			}
		};
	}

	async connectedCallback() {
		console.log("Chat CONNECTED");
	}

	disconnectedCallback() {
		console.log("Chat DISCONNECTED");
	}
}

customElements.define("chat-component", ChatComponent);

export { ChatComponent };
