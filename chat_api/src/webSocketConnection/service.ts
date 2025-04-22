export async function postRequestCreateUser(
	userId: string,
) {
	const response = await fetch("http://chat_db_container:3004/chat/createUser", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ userId }),
	});
	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}
	const data = await response.json();
	return data;
}

export async function patchRequestBlockUser(
	userId: string,
	friendId: string,
) {
	const response = await fetch("http://chat_db_container:3004/chat/blockUser", {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ userId, friendId }),
	});
	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}
	const data = await response.json();
	return data;
}

export async function patchRequestUnblockUser(
	userId: string,
	friendId: string,
) {
	const response = await fetch("http://chat_db_container:3004/chat/unblockUser", {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ userId, friendId }),
	});
	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}
	const data = await response.json();
	return data;
}

export async function getRequestRoomId( userId: string ) {
	const url = `http://pong-api:3010/playerRoom/${userId}`;
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}
	const data = await response.json();
	return data;
}
