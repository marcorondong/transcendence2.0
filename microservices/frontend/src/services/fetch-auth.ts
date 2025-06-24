import { Auth } from "./auth";
import type { UserAuth } from "../types/User";
import { notificationEvent, signInLinkEvent } from "./events";
import type { FetchConfig } from "../types/Fetch";
import { fetchPong } from "./fetch";

export class FetchAuth {
	static async signIn(user: UserAuth) {
		const config: FetchConfig = {
			method: "POST",
			headers: {
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
			headers: {
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
			method: "POST",
			headers: { accept: "application/json" },
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
			headers: { accept: "application/json" },
		};
		await fetchPong(config);
	}

	static async verifyConnection() {
		const config: FetchConfig = {
			url: "/auth-api/verify-connection",
			method: "GET",
			headers: { accept: "application/json" },
		};
		return await fetchPong(config);
	}

	static async updateJwt() {
		const config: FetchConfig = {
			url: "/auth-api/update-jwt",
			method: "POST",
			headers: { accept: "application/json" },
		};
		return await fetchPong(config);
	}
}
