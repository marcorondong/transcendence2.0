class ChatComponent extends HTMLElement {
	wss: WebSocket | undefined = undefined;

	constructor() {
		super();

		const queryParams = window.location.search;
		this.wss = new WebSocket(
			`wss://${window.location.hostname}:${window.location.port}/chat/${queryParams}`,
		);

		this.wss.onmessage = (event) => {
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
