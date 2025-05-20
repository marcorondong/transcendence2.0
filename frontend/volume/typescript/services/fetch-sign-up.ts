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
	// let url = `http://${window.location.hostname}:3000/api/users/`;

	try {
		const ret = await fetch(url, {
			method: method,
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(user),
		});

		if (!ret.ok) {
			throw new Error(`Response status: ${ret.status}`);
		}

		const data = await ret.json();
		return data;
	} catch (e) {
		console.error(e.message);
	}
}
