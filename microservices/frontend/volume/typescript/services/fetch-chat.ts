export async function fetchChatDb(
	userId: string | undefined,
	friendId: string | undefined,
	action: "block-status" | "toggle-block",
) {
	if (!userId || !friendId) {
		return;
	}

	let method: string = "GET";
	let payload: { userId: string; friendId: string } | null = null;
	let url = `https://${window.location.hostname}:${window.location.port}/chat-db/${action}/${userId}/${friendId}`;

	switch (action) {
		case "block-status":
			break;
		case "toggle-block":
			method = "PATCH";
			payload = {
				userId,
				friendId,
			};
			url = `https://${window.location.hostname}:${window.location.port}/chat-db/${action}`;
	}

	try {
		const ret = await fetch(url, {
			method: method,
			headers: {
				"Content-Type": "application/json",
			},
			body: payload ? JSON.stringify(payload) : null,
		});

		if (!ret.ok) {
			throw new Error(`Response status: ${ret.status}`);
		}

		const data = await ret.json();
		return data;
	} catch (e) {
		let message = "";
		if (e instanceof Error) {
			message = "e.message";
		}
		console.error(message);
	}
}
