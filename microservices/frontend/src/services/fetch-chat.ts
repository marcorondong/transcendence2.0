import type { FetchConfig } from "../types/Fetch";
import { fetchPong } from "./fetch";

export class FetchChatDb {
	static async blockStatus(
		userId: string | undefined,
		friendId: string | undefined,
	) {
		const config: FetchConfig = {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			url: `/chat-db/block-status/${userId}/${friendId}`,
		};
		try {
			return await fetchPong(config);
		} catch (e) {
			console.log(e);
			return undefined;
		}
	}

	static async toggleBlock(
		userId: string | undefined,
		friendId: string | undefined,
	) {
		const config: FetchConfig = {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"accept": "application/json",
			},
			body: {
				userId: userId,
				friendId: friendId,
			},
			url: `/chat-db/toggle-block`,
		};
		try {
			return await fetchPong(config);
		} catch (e) {
			console.log(e);
			return undefined;
		}
	}
}

// export async function fetchChatDb(
// 	userId: string | undefined,
// 	friendId: string | undefined,
// 	action: "block-status" | "toggle-block",
// ) {
// 	if (!userId || !friendId) {
// 		return;
// 	}
//
// 	let method: string = "GET";
// 	let payload: { userId: string; friendId: string } | null = null;
// 	let url = `https://${window.location.hostname}:${window.location.port}/chat-db/${action}/${userId}/${friendId}`;
//
// 	switch (action) {
// 		case "block-status":
// 			break;
// 		case "toggle-block":
// 			method = "PATCH";
// 			payload = {
// 				userId,
// 				friendId,
// 			};
// 			url = `https://${window.location.hostname}:${window.location.port}/chat-db/${action}`;
// 	}
//
// 	try {
// 		const ret = await fetch(url, {
// 			method: method,
// 			headers: {
// 				"Content-Type": "application/json",
// 			},
// 			body: payload ? JSON.stringify(payload) : null,
// 		});
//
// 		if (!ret.ok) {
// 			throw new Error(`Response status: ${ret.status}`);
// 		}
//
// 		const data = await ret.json();
// 		return data;
// 	} catch (e) {
// 		//TODO: don't change the error message here
// 		let message = "";
// 		if (e instanceof Error) {
// 			message = "e.message";
// 		}
// 		console.error(message);
// 	}
// }
