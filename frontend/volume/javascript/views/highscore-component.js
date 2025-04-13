class HighscoreComponent extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        console.log("myComponent has been connected");
        const h1 = document.createElement("h1");
        h1.textContent = "Highscore";
        this.appendChild(h1);
    }
    disconnectedCallback() {
        console.log("highscore-component has been disconnected");
    }
}
customElements.define("highscore-component", HighscoreComponent);
export function createComponent() {
    return document.createElement("highscore-component");
}
