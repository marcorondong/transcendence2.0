import { FetchConfig } from "../types/Fetch.js";
import { UserPut } from "../types/User.js";
import { fetchPong } from "./fetch.js";

export class FetchUsers {
	static async user(id: string) {
		const config: FetchConfig = {
			method: "GET",
			headers: {
				accept: "application/json",
			},
			url: "/api/users/" + id,
		};

		return await fetchPong(config);
	}
	static async userPut(id: string, body: UserPut, picture: File | undefined) {
		console.log("picture", picture);
		if (picture) {
			const formData = new FormData();
			formData.append("picture", picture);
			const config: FetchConfig = {
				method: "PUT",
				headers: {
					accept: "application/json",
				},
				url: "/api/users/" + id + "/picture",
				body: formData,
			};

			await fetchPong(config);
			return;
		}

		if (Object.values(body).every((v) => v === undefined)) {
			return;
		}

		const config: FetchConfig = {
			method: "PATCH",
			headers: {
				"accept": "application/json",
				"Content-Type": "application/json",
			},
			url: "/api/users/" + id,
			body,
		};

		return await fetchPong(config);
	}
}
