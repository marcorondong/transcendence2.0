import { FetchConfig } from "../types/Fetch.js";
import { Stats } from "../types/Pong.js";
import { MatchHistory, User } from "../types/User.js";
import { fetchPong } from "./fetch.js";

export class FetchPongDb {
	static async stats(userIds: string[]): Promise<Stats[]> {
		const statsConfig: FetchConfig<User> = {
			url: `/pong-db/users-stats`,
			header: {
				"accept": "application/json",
				"Content-Type": "application/json",
			},
			method: "POST",
			body: { userIds: userIds },
			// validator: validateStats,
		};
		// TODO: replace this AS with valibot parse
		return (await fetchPong(statsConfig)) as Stats[];
	}
	static async matchHistory(userId: string): Promise<MatchHistory[]> {
		const statsConfig: FetchConfig<User> = {
			url: `/pong-db/game-history/${userId}`,
			header: {
				accept: "application/json",
			},
			method: "GET",
			// validator: validateMatchHistory,
		};
		// TODO: replace this AS with valibot parse
		return (await fetchPong(statsConfig)) as MatchHistory[];
	}
}
