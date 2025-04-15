"use strict";

class ProfileComponent extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		console.log("myComponent has been connected");
		const h1 = document.createElement("h1");
		h1.textContent = "Profile";
		this.appendChild(h1);
	}

	disconnectedCallback() {
		console.log("myComponent has been disconnected");
	}
}

customElements.define("profile-component", ProfileComponent);

export function createComponent() {
	console.log("creating element");
	return document.createElement("profile-component");
}
