import type { GameMode, GameRoom, TournamentSize } from "./Game";
import type { User } from "./User";

export type Method = "GET" | "POST" | "PUT" | "POST" | "DELETE" | "PATCH";

export interface FetchConfig<T = unknown> {
	method: Method;
	headers?: HeadersInit;
	url: string;
	body?: any;
	validator?: (data: unknown) => T;
	form?: any;
}

export interface PongQueryParams {
	mode?: GameMode;
	room?: GameRoom | TournamentSize | string;
}

export interface FriendRequest {
	fromId: string;
	toId: string;
	message: string;
}

export interface Me {
	id: string;
	nickname: string;
}

export interface FriendRequestPending {
	id: string;
	fromId: string;
	from: User;
	toId: string;
	to: User;
	message: string;
	createdAt: string;
}
