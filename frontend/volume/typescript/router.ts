export class Router {
	containerDiv = document.getElementById("content");
	navLinks = document.querySelectorAll<HTMLAnchorElement>("#navigation a");
	component: Node | null = null;

	navComponents: string[] = this.createComponentNames();

	createComponentNames() {
		const array: string[] = [];
		for (const link of this.navLinks) {
			const str = link.href;
			const result = this.stringAfterSlash(str);
			array.push(result);
		}

		return array;
	}

	stringAfterSlash(link: string) {
		const n = link.lastIndexOf("/");
		return link.substring(n);
	}

	setActiveViewinNavigation(link: string) {
		const navLinks = [...this.navLinks];
		navLinks.map((l) => {
			const li = l.querySelector("li");
			if (li) {
				li.classList.remove("dark:bg-indigo-900");
			}
		});
		const linkElement = navLinks.find(
			(l) =>
				this.stringAfterSlash(l.href) === this.stringAfterSlash(link),
		);

		const listItem = linkElement?.querySelector("li");
		if (listItem) {
			listItem.classList.add("dark:bg-indigo-900");
		}
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
		let scriptName: string;
		if (componentName === "/" || componentName === "/index.html") {
			scriptName = "./views/home-view.js";
		} else if (this.navComponents.indexOf(componentName) > -1) {
			scriptName = `./views${componentName}.js`;
		} else {
			scriptName = `./views/error-view.js`;
		}
		const js = await import(scriptName);
		return js;
	}

	async appendComponent() {
		const componentName = window.location.pathname;
		this.setActiveViewinNavigation(componentName);
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
