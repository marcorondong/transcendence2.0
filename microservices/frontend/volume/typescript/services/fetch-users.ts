import { FetchConfig } from "../types/Fetch.js";
import { fetchPong } from "./fetch.js";

export class FetchUsers {
	static async users(id: string) {
		const config: FetchConfig = {
			method: "GET",
			header: {
				accept: "application/json",
			},
			url: "/api/users/" + id,
		};

		return await fetchPong(config);
	}
}
