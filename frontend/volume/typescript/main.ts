// GLOBAL VARIABLES
class Home {
	containerDiv = document.getElementById("content");
	navLinks = document.querySelectorAll<HTMLAnchorElement>("nav li a");
	component = null;
	js = null;

	navComponents: string[] = [];

	createComponentNames() {
		for (const link of this.navLinks) {
			const str = link.href;
			const n = str.lastIndexOf("/");
			const result = str.substring(n);
			this.navComponents.push(result);
		}
	}

	addEventListenerNavLinks() {
		for (const link of this.navLinks) {
			link.addEventListener("click", (event) => {
				event.preventDefault();
				window.history.pushState(
					{ path: event.target.href },
					"",
					event.target.href,
				);
				this.loadComponent();
			});
		}
	}
}

// window.addEventListener("popstate", () => {
// 	console.log("loading: ", window.location.pathname);
// 	loadComponent(window.location.pathname);
// });

// async function importComponent(componentName) {
// 	console.log(navComponents);
// 	console.log(navLinks);
// 	let scriptname;
// 	if (componentName === "/" || componentName === "/index.html") {
// 		scriptname = "./views/home-component.js";
// 	} else if (navComponents.indexOf(componentName) > -1) {
// 		scriptname = `./views${componentName}-component.js`;
// 	} else {
// 		console.log("GOT HEEEREEE");
// 		scriptname = `./views/error-component.js`;
// 	}
// 	const js = await import(scriptname);
// 	console.log("successfully imported component javascript:", scriptname);
// 	return js;
// }

// async function appendComponent() {
// 	const componentName = window.location.pathname;
// 	console.log("COMPONENT NAME", componentName);
// 	try {
// 		js = await importComponent(componentName);
// 	} catch (e) {
// 		console.error(e);
// 		return;
// 	}
// 	component = js.createComponent();
// 	containerDiv.appendChild(component);
// }

// function loadComponent() {
// 	if (component) {
// 		containerDiv.removeChild(component);
// 	}
// 	appendComponent();
// }

// loadComponent();
