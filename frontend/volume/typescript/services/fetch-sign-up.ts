import { signInLinkEvent } from "./events.js";

interface User {
	id?: string;
	email?: string;
	username?: string;
	nickname?: string;
	password?: string;
}

export async function fetchSignUp(user: User) {
	let method: string = "POST";
	let url = `https://${window.location.hostname}:${window.location.port}/api/users/`;

	try {
		const ret = await fetch(url, {
			method: method,
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(user),
		});

		if (!ret.ok) {
			// TODO: make failing of sign up visible in frontend
			throw new Error(`Response status: ${ret.status}`);
		} else {
			document.dispatchEvent(signInLinkEvent);
		}
	} catch (e) {
		console.error(e.message);
	}
}
