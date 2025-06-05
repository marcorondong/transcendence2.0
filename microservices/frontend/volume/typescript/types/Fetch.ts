export type Method = "GET" | "POST" | "PUT" | "POST" | "DELETE";

export interface FetchConfig<T = unknown> {
	method: Method;
	header: HeadersInit;
	url: string;
	body?: any;
	validator?: (data: unknown) => T;
}
