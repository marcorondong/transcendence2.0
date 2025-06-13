import { FetchConfig } from "../types/Fetch.js";
import { UserPut } from "../types/User.js";
import { fetchPong } from "./fetch.js";

export class FetchUsers {
	static async user(id: string) {
		const config: FetchConfig = {
			method: "GET",
			header: {
				accept: "application/json",
			},
			url: "/api/users/" + id,
		};

		return await fetchPong(config);
	}
	static async userPut(id: string, body: UserPut) {
		const config: FetchConfig = {
			method: "PUT",
			header: {
				"accept": "application/json",
				"Content-Type": "application/json",
			},
			url: "/api/users/" + id,
			body,
		};

		return await fetchPong(config);
	}
}
