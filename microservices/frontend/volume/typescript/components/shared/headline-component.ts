class HeadlineComponent extends HTMLElement {
	text: string;
	constructor(text: string) {
		super();
		this.text = text;
	}

	connectedCallback() {
		const headline = document.createElement("h1");
		headline.innerText = this.text;
		headline.classList.add("pong-heading", "pong-heading-big", "mb-6");
		this.append(headline);
	}

	disconnectedCallback() {}
}

customElements.define("headline-component", HeadlineComponent);

export { HeadlineComponent };
