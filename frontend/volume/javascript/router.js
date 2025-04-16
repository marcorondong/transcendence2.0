var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Router {
    createComponentNames() {
        const array = [];
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
            link.addEventListener("click", (event) => {
                event.preventDefault();
                if (event.currentTarget instanceof HTMLAnchorElement) {
                    window.history.pushState({ path: event.currentTarget.href }, "", event.currentTarget.href);
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
        this.containerDiv = document.getElementById("content");
        this.navLinks = document.querySelectorAll("nav a");
        this.component = null;
        this.navComponents = this.createComponentNames();
        this.addEventListenerNavLinks();
        window.addEventListener("popstate", () => {
            console.log("loading: ", window.location.pathname);
            this.loadComponent();
        });
    }
    importComponent(componentName) {
        return __awaiter(this, void 0, void 0, function* () {
            let scriptname;
            if (componentName === "/" || componentName === "/index.html") {
                scriptname = "./views/home-component.js";
            }
            else if (this.navComponents.indexOf(componentName) > -1) {
                scriptname = `./views${componentName}-component.js`;
            }
            else {
                scriptname = `./views/error-component.js`;
            }
            const js = yield import(scriptname);
            console.log("successfully imported component javascript:", scriptname);
            return js;
        });
    }
    appendComponent() {
        return __awaiter(this, void 0, void 0, function* () {
            const componentName = window.location.pathname;
            console.log("COMPONENT NAME", componentName);
            try {
                const js = yield this.importComponent(componentName);
                if (js && this.containerDiv) {
                    this.component = js.createComponent();
                    if (this.component) {
                        this.containerDiv.appendChild(this.component);
                    }
                }
            }
            catch (e) {
                console.error(e);
                return;
            }
        });
    }
}
