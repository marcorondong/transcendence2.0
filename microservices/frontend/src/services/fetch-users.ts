import type { FetchConfig, FriendRequest } from "../types/Fetch";
import type { UserPut } from "../types/User";
import { fetchPong } from "./fetch";

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

	static async userDelete(id: string) {
		const config: FetchConfig = {
			method: "DELETE",
			headers: {
				accept: "application/json",
			},
			url: "/api/users/" + id,
		};

		return await fetchPong(config);
	}

	static async userPutAvatar(id: string) {
		const uploadInput = document.getElementById(
			"uploadAvatar",
		) as HTMLInputElement;
		if (uploadInput?.files?.[0]) {
			const form = new FormData();
			const imageFile = uploadInput.files[0];
			form.append("picture", imageFile);
			const config: FetchConfig = {
				method: "PUT",
				headers: undefined,
				form: form,
				url: "/api/users/" + id + "/picture",
			};

			return await fetchPong(config);
		}
		return undefined;
	}

	static async userPatch(id: string, body: UserPut) {
		if (Object.values(body).every((v) => v === undefined)) {
			return undefined;
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

	static async friendRequestPost(body: FriendRequest) {
		const config: FetchConfig = {
			method: "POST",
			headers: {
				"accept": "application/json",
				"Content-Type": "application/json",
			},
			url: "/api/friend-requests/",
			body,
		};

		return await fetchPong(config);
	}

	static async friendRequestGetFromMe(id: string) {
		const config: FetchConfig = {
			method: "GET",
			headers: {
				accept: "application/json",
			},
			url: "/api/friend-requests/?fromId=" + id,
		};

		return await fetchPong(config);
	}

	static async friendRequestGetToMe(id: string) {
		const config: FetchConfig = {
			method: "GET",
			headers: {
				accept: "application/json",
			},
			url: "/api/friend-requests/?toId=" + id,
		};

		return await fetchPong(config);
	}

	static async friendRequestDelete(id: string) {
		const config: FetchConfig = {
			method: "DELETE",
			headers: {
				accept: "application/json",
			},
			url: "/api/friend-requests/" + id,
		};

		return await fetchPong(config);
	}

	static async friendRequestAccept(id: string) {
		const config: FetchConfig = {
			method: "POST",
			headers: {
				accept: "application/json",
			},
			url: "/api/friend-requests/" + id + "/accept",
		};

		return await fetchPong(config);
	}

	static async friendsGet(id: string) {
		const config: FetchConfig = {
			method: "GET",
			headers: {
				accept: "application/json",
			},
			url: "/api/users/" + id + "/friends",
		};

		return await fetchPong(config);
	}

	static async friendsDelete(myId: string, friendId: string) {
		const config: FetchConfig = {
			method: "DELETE",
			headers: {
				accept: "application/json",
			},
			url: "/api/users/" + myId + "/friends/" + friendId,
		};

		return await fetchPong(config);
	}
}
