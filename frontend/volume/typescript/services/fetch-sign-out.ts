export async function fetchSignOut() {
	let method: string = "DELETE";
	let url = `https://${window.location.hostname}:${window.location.port}/auth-api/sign-out`;
	console.log("trying to log out with url", url, 'method', method);

	try {
		const ret = await fetch(url, {
			method: method,
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!ret.ok) {
			throw new Error(`Response status: ${ret.status}`);
		}

		const data = await ret.json();
		console.log("fetch sign out response", data);
		return data;
	} catch (e) {
		console.error(e.message);
	}
}
