import { NotificationData, State } from "../types/Notification.js";

export const pongLinkEvent = new CustomEvent("pong-link", {
	detail: { source: "pong-view" },
	bubbles: true,
	composed: true,
});

export const errorLinkEvent = new CustomEvent("error-link", {
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

export const onlineUserEvent = new CustomEvent("online-user", {
	detail: { source: "new online user" },
	bubbles: true,
	composed: true,
});

export function notificationEvent(message: string, state: State) {
	const data: NotificationData = {
		message,
		state,
	};
	console.log("sending notification");
	return new CustomEvent("notification", {
		detail: { source: data },
		bubbles: true,
		composed: true,
	});
}
