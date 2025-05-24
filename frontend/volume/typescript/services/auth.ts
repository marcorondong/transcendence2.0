import { signInLinkEvent } from "./events.js";
import { FetchAuth } from "./fetch-auth.js";

export class Auth {
	static toggleAuthClasses(authorized: boolean) {
		const authNeededNodes = [...document.querySelectorAll(".auth-needed")];
		console.log("auth nodes", authNeededNodes);
		const noAuthNeededNodes = [
			...document.querySelectorAll(".no-auth-needed"),
		];
		if (authorized) {
			authNeededNodes.forEach((node) => node.classList.remove("hidden"));
			noAuthNeededNodes.forEach((node) => node.classList.add("hidden"));
		} else {
			noAuthNeededNodes.forEach((node) =>
				node.classList.remove("hidden"),
			);
			authNeededNodes.forEach((node) => node.classList.add("hidden"));
		}
	}
}
