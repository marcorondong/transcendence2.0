import "../components/pong-component";
import "../components/container-for-view";
import { PongComponent } from "../components/pong-component";
import { ChatComponent } from "../components/chat-component";
import type { PongQueryParams } from "../types/Fetch";
import type { GameMode } from "../types/Game";
import { GameModes } from "../types/Game";

class PongView extends HTMLElement {
  chat: ChatComponent;
  constructor(chat: ChatComponent) {
    super();
    this.chat = chat;
  }

  initPongQueryParams() {
    const pongQueryParams: PongQueryParams = {};
    const paramsString = window.location.search;
    const searchParams = new URLSearchParams(paramsString);
    const modeFromQuery = searchParams.get("mode");
    const roomFromQuery = searchParams.get("room");
    if (modeFromQuery && GameModes.find((x) => modeFromQuery === x)) {
      pongQueryParams.mode = modeFromQuery as GameMode;
    }
    if (roomFromQuery && roomFromQuery.length < 100) {
      pongQueryParams.room = roomFromQuery;
    }
    return pongQueryParams;
  }

  connectedCallback() {
    console.log("PONG VIEW has been CONNECTED");

    const container = document.createElement("container-for-view");
    this.append(container);
    const pongComponent = new PongComponent(
      this.chat,
      this.initPongQueryParams(),
    );
    container.appendChild(pongComponent);
    pongComponent.classList.add("self-center");
  }

  disconnectedCallback() {
    console.log("PONG VIEW has been DISCONNECTED");
  }
}

customElements.define("pong-view", PongView);

export function createComponent(chat: ChatComponent) {
  return new PongView(chat);
}
