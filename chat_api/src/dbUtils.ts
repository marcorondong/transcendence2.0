
export async function postRequestCreateUser(
	id: string,
) {
	try {
		const response = await fetch("http://chat_db_container:3004/chat/createUser", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id }),
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
	id: string,
	friendId: string,
) {
	try {
		const response = await fetch("http://chat_db_container:3004/chat/blockUser", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id, friendId }),
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
	id: string,
	friendId: string,
) {
	try {
		const response = await fetch("http://chat_db_container:3004/chat/unblockUser", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id, friendId }),
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
	id: string,
	friendId: string,
) {
	try {
		const response = await fetch(`http://chat_db_container:3004/chat/blockStatus/${id}/${friendId}`, {
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
	id: string,
) {
	try {
		const response = await fetch(`http://chat_db_container:3004/chat/blockList/${id}`, {
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