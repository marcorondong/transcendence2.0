import type { FetchConfig } from "../types/Fetch";
import type { Stats } from "../types/Pong";
import type { MatchHistory, User } from "../types/User";
import { fetchPong } from "./fetch";

export class FetchPongDb {
  static async stats(userIds: string[]): Promise<Stats[]> {
    const statsConfig: FetchConfig<User> = {
      url: `/pong-db/users-stats`,
      headers: {
        accept: "application/json",
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
      headers: {
        accept: "application/json",
      },
      method: "GET",
      // validator: validateMatchHistory,
    };
    // TODO: replace this AS with valibot parse
    return (await fetchPong(statsConfig)) as MatchHistory[];
  }
}
