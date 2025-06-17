import type { GameData } from "../types/Game";

class PlaySelectionComponent extends HTMLElement {
  gameData: GameData;
  h1: HTMLElement | null = null;
  constructor(gameData: GameData) {
    super();
    this.gameData = gameData;
  }

  connectedCallback() {
    this.replaceChildren();
    const playOptions = this.gameData.mode.find(
      (m) => this.gameData.selection.mode === m.id,
    );
    this.classList.add("flex", "flex-col", "items-center", "gap-8", "p-8");

    // PLAY OPTIONS
    const optionsContainer = document.createElement("div");
    optionsContainer.classList.add(
      "flex-col",
      "flex",
      "gap-1",
      "p-1",
      "w-full",
      "mx-12",
      "items-center",
      "rounded-2xl",
      "bg-indigo-950",
    );

    console.log("play options: ", playOptions);

    if (!playOptions) {
      return;
    }

    playOptions.play.forEach((m) => {
      const button = document.createElement("button");
      button.innerText = m.label;
      button.id = m.value;
      button.classList.add(
        "pong-button",
        "pong-button-info",
        "self-stretch",
        "play-button",
      );
      optionsContainer.append(button);
    });
    this.append(optionsContainer);
  }

  disconnectedCallback() {}
}

customElements.define("play-selection-component", PlaySelectionComponent);

export { PlaySelectionComponent };
