export const pongLinkEvent = new CustomEvent("pong-link", {
	detail: { source: "pong-view" },
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
