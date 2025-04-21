
export async function postRequestCreateUser(
	userId: string,
) {
	try {
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
	} catch (error) {
		console.error("Error in postRequestCreateUser:", error);
		throw error;
	}
}

export async function patchRequestBlockUser(
	userId: string,
	friendId: string,
) {
	try {
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
	} catch (error) {
		console.error("Error in patchRequestBlockUser:", error);
		throw error;
	}
}

export async function patchRequestUnblockUser(
	userId: string,
	friendId: string,
) {
	try {
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
	} catch (error) {
		console.error("Error in patchRequestUnblockUser:", error);
		throw error;
	}
}

export async function getRequestBlockStatus(
	userId: string,
	friendId: string,
) {
	try {
		const response = await fetch(`http://chat_db_container:3004/chat/blockStatus/${userId}/${friendId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});
		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}`);
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error in getRequestBlockStatus:", error);
		throw error;
	}
}

export async function getRequestBlockList(
	userId: string,
) {
	try {
		const response = await fetch(`http://chat_db_container:3004/chat/blockList/${userId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});
		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}`);
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error in getRequestBlockList:", error);
		throw error;
	}
}