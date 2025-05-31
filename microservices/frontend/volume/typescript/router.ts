import { ChatComponent } from "./components/chat-component.js";
import { Auth } from "./services/auth.js";
import { notificationEvent } from "./services/events.js";
import { FetchAuth } from "./services/fetch-auth.js";
import { baseUrl } from "./services/fetch.js";

export class Router {
	containerDiv = document.getElementById("content");
	navLinks = document.querySelectorAll<HTMLAnchorElement>("#navigation a");
	component: Node | null = null;
	chat: ChatComponent;

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

	async auth() {
		this.clearContent();
		try {
			await FetchAuth.verifyJwt();
			document.dispatchEvent(notificationEvent("JWT valid", "success"));
			Auth.toggleAuthClasses(true);
			this.loadComponent();
		} catch (e) {
			Auth.toggleAuthClasses(false);
		}
	}

	stringAfterSlash(link: string) {
		const n = link.lastIndexOf("/");
		return link.substring(n);
	}

	setActiveViewInNavigation(link: string) {
		const navLinks = [...this.navLinks];
		navLinks.map((l) => {
			l.classList.remove("pong-nav-link-active");
		});

		const linkElement = navLinks.find(
			(l) =>
				this.stringAfterSlash(l.href) === this.stringAfterSlash(link),
		);

		if (linkElement && linkElement.classList.contains("pong-nav-link")) {
			console.log("setting active linke!");
			linkElement.classList.add("pong-nav-link-active");
		}
	}

	handleRouterLink(event: Event) {
		event.preventDefault();
		let link: string = "";
		if (
			event instanceof MouseEvent &&
			event.currentTarget instanceof HTMLAnchorElement
		) {
			link = event.currentTarget.href;
			console.log("link", link);
		} else if (event instanceof CustomEvent) {
			link = event.detail.source;
		} else {
			return;
		}
		window.history.pushState({ path: link }, "", link);
		this.loadComponent();
	}

	addEventListenerNavLinks() {
		for (const link of this.navLinks) {
			link.addEventListener("click", this.handleRouterLink);
		}
	}

	clearContent() {
		if (this.containerDiv) {
			this.containerDiv.replaceChildren();
		}
	}
	loadComponent() {
		this.clearContent();
		this.appendComponent();
	}

	constructor(chat: ChatComponent) {
		this.chat = chat;
		this.handleRouterLink = this.handleRouterLink.bind(this);
		this.addEventListenerNavLinks();
		document.addEventListener("pong-link", this.handleRouterLink);
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
			window.history.pushState({ path: baseUrl }, "", baseUrl);
		}
		console.log("scriptname name: ", scriptName);
		const js = await import(scriptName);
		return js;
	}

	async appendComponent() {
		const componentName = window.location.pathname;
		this.setActiveViewInNavigation(componentName);
		try {
			const js = await this.importComponent(componentName);
			if (js && this.containerDiv) {
				this.component = js.createComponent(this.chat);
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
