import { IconComponent } from "../components/icon-component";

class FooterComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    console.log("FOOTER has been CONNECTED");
    const footer = document.createElement("footer");
    footer.classList.add(
      "flex",
      "flex-col",
      "sm:flex-row",
      "p-4",
      "gap-2",
      "items-center",
      "w-full",
      "justify-center",
      "text-slate-300/50",
      "text-xs",
      "text-center",
    );
    this.append(footer);

    const icon = new IconComponent("42", 6);
    icon.classList.add("invert", "opacity-30");

    const message = document.createElement("span");
    message.innerText =
      "Transcendence 2.0 made by Benni, Filip, Gabriel, Isi and Marco at";

    const vienna = document.createElement("span");
    vienna.innerText = "Vienna © 2025 ";

    footer.append(message, icon, vienna);
  }

  disconnectedCallback() {
    console.log("FOOTER has been DISCONNECTED");
  }
}

customElements.define("footer-component", FooterComponent);

export { FooterComponent };
