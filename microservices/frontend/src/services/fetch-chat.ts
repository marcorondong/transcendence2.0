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
			console.error(e);
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
			console.error(e);
			return undefined;
		}
	}
}
