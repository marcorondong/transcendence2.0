import { Auth } from "./auth.js";
import { homeLinkEvent, notificationEvent, signInLinkEvent } from "./events.js";
import { FetchConfig, fetchPong } from "./fetch.js";

export interface UserAuth {
	username: string;
	password: string;
}

export interface ProfileAuth {
	username: string;
	password: string;
	nickname: string;
	email: string;
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
		await fetchPong(config);
	}
	static async signUp(user: UserAuth) {
		const config: FetchConfig = {
			method: "POST",
			header: {
				"accept": "application/json",
				"Content-Type": "application/json",
			},
			body: user,
			url: "/auth-api/sign-up",
		};

		await fetchPong(config);
	}
	static async signOut() {
		const config: FetchConfig = {
			url: "/auth-api/sign-out",
			method: "DELETE",
			header: { accept: "application/json" },
		};
		try {
			await fetchPong(config);
			document.dispatchEvent(
				notificationEvent("You logged out!", "success"),
			);
			Auth.toggleAuthClasses(false);
			document.dispatchEvent(signInLinkEvent);
		} catch (e) {}
	}
	static async verifyJwt() {
		const config: FetchConfig = {
			url: "/auth-api/verify-jwt",
			method: "GET",
			header: { accept: "application/json" },
		};
		await fetchPong(config);
	}
}
