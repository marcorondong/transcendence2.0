class Home {
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
        console.log("component", this.component);
        console.log("div", this.containerDiv);
        console.log("div", this.navLinks);
        if (this.component && this.containerDiv) {
            this.containerDiv.removeChild(this.component);
        }
        this.appendComponent();
    }
    constructor() {
        this.containerDiv = document.getElementById("content");
        this.navLinks = document.querySelectorAll("nav li a");
        this.component = null;
        this.navComponents = this.createComponentNames();
        this.addEventListenerNavLinks();
        window.addEventListener("popstate", () => {
            console.log("loading: ", window.location.pathname);
            this.loadComponent();
        });
    }
    async importComponent(componentName) {
        console.log(this.navComponents);
        console.log(this.navLinks);
        let scriptname;
        if (componentName === "/" || componentName === "/index.html") {
            scriptname = "./views/home-component.js";
        }
        else if (this.navComponents.indexOf(componentName) > -1) {
            scriptname = `./views${componentName}-component.js`;
        }
        else {
            console.log("GOT HEEEREEE");
            scriptname = `./views/error-component.js`;
        }
        const js = await import(scriptname);
        console.log("successfully imported component javascript:", scriptname);
        return js;
    }
    async appendComponent() {
        const componentName = window.location.pathname;
        console.log("COMPONENT NAME", componentName);
        try {
            const js = await this.importComponent(componentName);
            if (js && this.containerDiv) {
                console.log("trying to createComponent");
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
    }
}
const home = new Home();
home.loadComponent();
console.log("hi there");
const queryParams = window.location.search;
const wss = new WebSocket(
// `ws://${window.location.hostname}:${window.location.port}/pong/${queryParams}`,
`wss://${window.location.hostname}:${window.location.port}/pong/${queryParams}`);
console.log("hi");
wss.onmessage = (event) => {
    console.log("got message");
    const gameState = JSON.parse(event.data);
    console.log("game State", gameState);
};
export {};
