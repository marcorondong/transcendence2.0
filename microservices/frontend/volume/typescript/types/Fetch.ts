import { GameMode, GameRoom, TournamentSize } from "./Game.js";

export type Method = "GET" | "POST" | "PUT" | "POST" | "DELETE" | "PATCH";

export interface FetchConfig<T = unknown> {
	method: Method;
	headers: HeadersInit;
	url: string;
	body?: any;
	validator?: (data: unknown) => T;
}

export interface PongQueryParams {
	mode?: GameMode;
	room?: GameRoom | TournamentSize | string;
}
