class ButtonComponent extends HTMLElement {
	button = document.createElement("button");
	listener: ((e: Event) => void) | undefined = undefined;
	constructor() {
		super();
	}

	addListener(listener: (e: Event) => void) {
		this.listener = listener;
	}

	addStyle(styles: string[]) {
		this.button.classList.add(...styles);
	}

	connectedCallback() {
		this.button.classList.add(
			"cursor-pointer",
			"rounded-lg",
			"text-center",
			"text-base",
			"font-medium",
			"px-2",
			"py-2",
			"text-indigo-900",
			"transition-colors",
			"duration-300",
			"hover:text-cyan-400",
			"disabled:cursor-default",
			"disabled:hover:bg-slate-300/10",
			"disabled:bg-slate-300/10",
			"disabled:border-slate-100/0",
			"disabled:opacity-30",
			"disabled:text-slate-400",
			"hover:disabled:text-slate-400",
			"dark:text-amber-50",
			"hover:dark:text-cyan-400",
			"no-underline whitespace-nowrap",
			"z-0",
		);
		this.addEventListener("click", this);
	}

	handleEvent(event: Event) {
		const handlerName =
			"on" + event.type.charAt(0).toUpperCase() + event.type.slice(1);
		const handler = this[handlerName as keyof this];
		if (typeof handler === "function") {
			handler.call(this, event);
		}
	}

	onClick(e: Event) {
		if (this.listener) {
			this.listener(e);
		}
	}

	disconnectedCallback() {
		this.removeEventListener("click", this);
	}
}

customElements.define("button-component", ButtonComponent);

export { ButtonComponent };
