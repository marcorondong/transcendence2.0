export class ProfileView extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		console.log("PROFILE VIEW has been CONNECTED");
		const h1 = document.createElement("h1");
		h1.textContent = "Profile";
		this.appendChild(h1);
	}

	disconnectedCallback() {
		console.log("PROFILE VIEW has been DISCONNECTED");
	}
}

customElements.define("profile-view", ProfileView);

export function createComponent() {
	return document.createElement("profile-view");
}
