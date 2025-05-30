import { Auth } from "./auth.js";
import { notificationEvent, signInLinkEvent } from "./events.js";
import { FetchConfig, fetchPong } from "./fetch.js";

export interface UserAuth {
	username: string;
	password: string;
}

export class FetchAuth {
	static async signIn(user: UserAuth) {
		const config: FetchConfig = {
			method: "POST",
			header: {
				"accept": "application/json",
				"Content-Type": "application/json",
			},
			body: user,
			url: "/auth-api/sign-in",
		};

		const returnValue = await fetchPong(config);
		if (returnValue && returnValue.response.ok)
			document.dispatchEvent(
				notificationEvent("You just signed in!", "success"),
			);
		Auth.toggleAuthClasses(true);
		return returnValue;
	}
	static async signOut() {
		const config: FetchConfig = {
			url: "/auth-api/sign-out",
			method: "DELETE",
			header: { accept: "application/json" },
		};
		console.log("running sign out");
		const returnValue = await fetchPong(config);
		if (returnValue && returnValue.response.ok) {
			document.dispatchEvent(
				notificationEvent("You logged out!", "success"),
			);
			Auth.toggleAuthClasses(false);
			document.dispatchEvent(signInLinkEvent);
		}
	}
	static async verifyJwt() {
		const config: FetchConfig = {
			url: "/auth-api/verify-jwt",
			method: "GET",
			header: { accept: "application/json" },
		};
		const returnValue = await fetchPong(config);
		if (!returnValue) {
			Auth.toggleAuthClasses(false);
		} else if (returnValue.response.ok) {
			document.dispatchEvent(notificationEvent("JWT valid", "success"));
			Auth.toggleAuthClasses(true);
		}
		return returnValue;
	}
}
