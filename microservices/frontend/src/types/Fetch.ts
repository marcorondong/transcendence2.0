import type { GameMode, GameRoom, TournamentSize } from "./Game";

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
