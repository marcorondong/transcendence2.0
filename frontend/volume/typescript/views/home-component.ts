class HomeComponent extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		console.log("HomeComponent has been connected");
		const h1 = document.createElement("h1");
		h1.className =
			"mb-4 font-bold leading-none text-gray-900 text-3xl dark:text-gray-200";
		h1.textContent = "Home";
		this.appendChild(h1);
	}

	disconnectedCallback() {
		console.log("HomeComponent has been disconnected");
	}
}

customElements.define("home-component", HomeComponent);

export function createComponent() {
	console.log("creating element");
	return document.createElement("home-component");
}
