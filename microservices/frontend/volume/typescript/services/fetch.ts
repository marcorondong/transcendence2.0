import { notificationEvent, signInLinkEvent } from "./events.js";

export type Method = "GET" | "POST" | "PUT" | "POST" | "DELETE";

export interface FetchConfig<T = unknown> {
	method: Method;
	header: HeadersInit;
	url: string;
	body?: any;
	validator?: (data: unknown) => T;
}
export const baseUrl = `https://${window.location.hostname}:${window.location.port}`;

export async function fetchPong<T = unknown>(config: FetchConfig<T>) {
	const { url, method, header, body, validator } = config;

	const response = await fetch(baseUrl + url, {
		method: method,
		headers: header,
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		document.dispatchEvent(notificationEvent(response.statusText, "error"));
		if (response.status === 401) {
			document.dispatchEvent(signInLinkEvent);
		}
		throw new Error(`Response status: ${response.status}`);
	}

	// Check if response has a body
	const contentLength = response.headers.get("Content-Length");
	const contentType = response.headers.get("Content-Type");

	const hasBody =
		(contentLength && parseInt(contentLength) > 0) ||
		(contentType && contentType.includes("application/json"));

	if (hasBody) {
		return response.json();
		// const data = (await response.json()) as Promise<T>;
		// return validator ? validator(data) : (data as T);
	}

	return undefined;
}
