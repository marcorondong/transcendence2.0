import type { GameData } from "../types/Game";

class ModeSelectionComponent extends HTMLElement {
  gameData: GameData;
  h1: HTMLElement | null = null;
  constructor(gameData: GameData) {
    super();
    this.gameData = gameData;
  }

  connectedCallback() {
    this.replaceChildren();

    //MATCH TYPE
    this.classList.add("flex", "flex-col", "items-center", "gap-8", "p-8");

    // MATCH TYPE OPTIONS
    const optionsContainer = document.createElement("div");
    optionsContainer.classList.add(
      "flex-col",
      "flex",
      "p-1",
      "gap-1",
      "w-full",
      "mx-12",
      "items-center",
      "rounded-lg",
      "bg-indigo-950",
    );

    this.gameData.mode.forEach((m) => {
      const button = document.createElement("button");
      button.innerText = m.label;
      button.id = m.id;
      button.classList.add(
        "pong-button",
        "pong-button-info",
        "p-3",
        "self-stretch",
        "rounded-2xl",
        "cursor-pointer",
        "mode-button",
      );
      optionsContainer.append(button);
    });
    this.append(optionsContainer);
  }

  disconnectedCallback() {}
}

customElements.define("mode-selection-component", ModeSelectionComponent);

export { ModeSelectionComponent };
