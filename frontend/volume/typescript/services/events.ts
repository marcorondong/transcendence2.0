export const pongLinkEvent = new CustomEvent("pong-link", {
	detail: { source: "pong-view" },
	bubbles: true,
	composed: true,
});
