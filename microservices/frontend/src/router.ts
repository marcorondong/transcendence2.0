import { ChatComponent } from "./components/chat-component";
import { Auth } from "./services/auth";
import { notificationEvent } from "./services/events";
import { FetchAuth } from "./services/fetch-auth";
import { baseUrl } from "./services/fetch";

const viewModules = import.meta.glob("./views/*.ts");

interface ViewModule {
	createComponent: (chat: any) => HTMLElement;
}

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
			this.chat.openWebsocket();
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
			linkElement.classList.add("pong-nav-link-active");
		}
	}

	// handles two possibilities:
	// user clicks on link -> href is written into browser uri
	// customEvent  -> the content of event.detail.source goes into uri
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
		document.addEventListener("error-link", this.handleRouterLink);
		window.addEventListener("popstate", () => {
			this.loadComponent();
		});
	}

	async importComponent(componentName: string) {
		let scriptName: string;
		if (componentName === "/" || componentName === "/index.html") {
			scriptName = "/home-view";
		} else if (this.navComponents.indexOf(componentName) > -1) {
			scriptName = componentName;
		} else {
			scriptName = "/error-view";
			window.history.pushState({ path: baseUrl }, "", baseUrl);
		}
		console.log("script name: ", scriptName);
		const path = `./views${scriptName}.ts`;
		const loader = viewModules[path];
		if (!loader) {
			throw new Error(`View not found: ${path}`);
		}
		const module = await loader();
		return module;
	}

	async appendComponent() {
		const componentName = window.location.pathname;
		this.setActiveViewInNavigation(componentName);
		try {
			const js = (await this.importComponent(
				componentName,
			)) as ViewModule;
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
