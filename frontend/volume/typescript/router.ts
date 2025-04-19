export class Router {
	containerDiv = document.getElementById("content");
	navLinks = document.querySelectorAll<HTMLAnchorElement>("nav a");
	component: Node | null = null;

	navComponents: string[] = this.createComponentNames();

	createComponentNames() {
		const array: string[] = [];
		for (const link of this.navLinks) {
			const str = link.href;
			const n = str.lastIndexOf("/");
			const result = str.substring(n);
			array.push(result);
		}

		return array;
	}

	addEventListenerNavLinks() {
		for (const link of this.navLinks) {
			link.addEventListener("click", (event: Event) => {
				event.preventDefault();
				if (event.currentTarget instanceof HTMLAnchorElement) {
					window.history.pushState(
						{ path: event.currentTarget.href },
						"",
						event.currentTarget.href,
					);
					this.loadComponent();
				}
			});
		}
	}

	loadComponent() {
		if (this.component && this.containerDiv) {
			this.containerDiv.removeChild(this.component);
		}
		this.appendComponent();
	}

	constructor() {
		this.addEventListenerNavLinks();
		window.addEventListener("popstate", () => {
			this.loadComponent();
		});
	}

	async importComponent(componentName: string) {
		let scriptname: string;
		if (componentName === "/" || componentName === "/index.html") {
			scriptname = "./views/home-view.js";
		} else if (this.navComponents.indexOf(componentName) > -1) {
			scriptname = `./views${componentName}-view.js`;
		} else {
			scriptname = `./views/error-view.js`;
		}
		const js = await import(scriptname);
		return js;
	}

	async appendComponent() {
		const componentName = window.location.pathname;
		try {
			const js = await this.importComponent(componentName);
			if (js && this.containerDiv) {
				this.component = js.createComponent();
				if (this.component) {
					this.containerDiv.appendChild(this.component);
				}
			}
		} catch (e) {
			console.error(e);
			return;
		}
	}
}
