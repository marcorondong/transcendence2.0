class ContainerForViewComponent extends HTMLElement {
	constructor() {
		super();
	}

	async connectedCallback() {
		this.classList.add("flex", "flex-col", "items-start");
	}

	disconnectedCallback() {}
}

customElements.define("container-for-view", ContainerForViewComponent);

export { ContainerForViewComponent };
