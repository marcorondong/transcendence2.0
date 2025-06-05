import "../components/pong-component.js";
import "../components/container-for-view.js";
import { PongComponent } from "../components/pong-component.js";
import { ChatComponent } from "../components/chat-component.js";
import { GameMode } from "../types/Game.js";

export interface PongMeta {
	mode?: GameMode;
	roomId?: string;
	size?: 4 | 8 | 16;
}

class PongView extends HTMLElement {
	chat: ChatComponent;
	constructor(chat: ChatComponent) {
		super();
		this.chat = chat;
	}

	initPongMeta() {
		const pongMeta: PongMeta = {};
		const paramsString = window.location.search;
		const searchParams = new URLSearchParams(paramsString);
		const modeFromQuery = searchParams.get("mode");
		const roomIdFromQuery = searchParams.get("roomId");
		const sizeFromQuery = Number(searchParams.get("size"));
		//TODO: this is super shitty. should be done with valibot or zod. also
		//the values of check should not be hardcoded . What if sizes
		//of tournaments changes?
		if (
			sizeFromQuery &&
			(sizeFromQuery === 4 || sizeFromQuery === 8 || sizeFromQuery === 16)
		) {
			pongMeta.size = sizeFromQuery;
		}
		if (
			modeFromQuery &&
			(modeFromQuery === "tournament" ||
				modeFromQuery === "singles" ||
				modeFromQuery === "doubles" ||
				modeFromQuery === "spectate")
		) {
			pongMeta.mode = modeFromQuery;
		}
		if (roomIdFromQuery && roomIdFromQuery.length < 100) {
			pongMeta.roomId = roomIdFromQuery;
		}
		return pongMeta;
	}

	connectedCallback() {
		console.log("PONG VIEW has been CONNECTED");

		const container = document.createElement("container-for-view");
		this.append(container);
		const pongComponent = new PongComponent(this.chat, this.initPongMeta());
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
