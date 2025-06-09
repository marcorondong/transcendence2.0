import { GameSelection } from "../types/Game.js";
import { NotificationData, State } from "../types/Notification.js";
import { baseUrl } from "./fetch.js";

export const errorLinkEvent = new CustomEvent("pong-link", {
	detail: { source: "error-view" },
	bubbles: true,
	composed: true,
});

export const homeLinkEvent = new CustomEvent("pong-link", {
	detail: { source: "/" },
	bubbles: true,
	composed: true,
});

export const signUpLinkEvent = new CustomEvent("pong-link", {
	detail: { source: "sign-up-view" },
	bubbles: true,
	composed: true,
});

export const signInLinkEvent = new CustomEvent("pong-link", {
	detail: { source: "sign-in-view" },
	bubbles: true,
	composed: true,
});

export const onlineUserEvent = new CustomEvent("onlineuser", {
	detail: { source: "new online user" },
	bubbles: true,
	composed: true,
});

export function pongLinkEvent(selection?: GameSelection) {
	let url = "";
	// TODO: 👇 if we implement tictactoe then should not be hardcoded
	url += "/pong-view";

	if (selection?.mode) {
		url += "?mode=" + selection.mode;
		if (selection?.room) {
			url += "&room=" + selection.room;
		}
	}
	console.log("url when pong view from custom event:", url);

	return new CustomEvent("pong-link", {
		detail: { source: url },
		bubbles: true,
		composed: true,
	});
}

export function profileLinkEvent(uuid: string) {
	let url = "/profile-view?userId=" + uuid;

	return new CustomEvent("pong-link", {
		detail: { source: url },
		bubbles: true,
		composed: true,
	});
}

export function notificationEvent(message: string, state: State) {
	const data: NotificationData = {
		message,
		state,
	};
	return new CustomEvent("notification", {
		detail: { source: data },
		bubbles: true,
		composed: true,
	});
}
