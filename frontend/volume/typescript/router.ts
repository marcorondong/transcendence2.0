import { ChatComponent } from "./components/chat-component.js";

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

	// helo there whats up?
	// write a auth handler function here, that checks inititally if the user
	// has sign in  rights or not. If not user should be redirected to the sign
	// in page. from sign in page sign up page should be reachable
	// every http call and ws connection should react correctly to a 401
	// response. This means on 401 user should be redirected to login.
	//
	// what about switching to another view? should that also check the token?
	// what about a running websocket? is that checked with every transmit over
	// the ws?
	//
	// handle token refresh. So upon receiving a 401, a token refresh call
	// should be made. If that succeeds the initial http call should be
	// repeated. If the refresh fails -> sign in page
	//
	// handle token refresh on user activity

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

	loadComponent() {
		if (this.component && this.containerDiv) {
			this.containerDiv.removeChild(this.component);
		}
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
		console.log("component name", componentName);
		if (componentName === "/" || componentName === "/index.html") {
			scriptName = "./views/home-view.js";
		} else if (this.navComponents.indexOf(componentName) > -1) {
			scriptName = `./views${componentName}.js`;
		} else {
			scriptName = `./views/error-view.js`;
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
			console.log("js:", js);
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
