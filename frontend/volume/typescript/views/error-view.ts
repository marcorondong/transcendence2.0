"use strict";

export class ErrorComponent extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		console.log("ERROR has been CONNECTED");
		const h1 = document.createElement("h1");
		h1.textContent = "404 Page not found";
		this.appendChild(h1);
	}

	disconnectedCallback() {
		console.log("ERROR has been DISCONNECTED");
	}
}

customElements.define("error-view", ErrorComponent);

export function createComponent() {
	return document.createElement("error-view");
}
