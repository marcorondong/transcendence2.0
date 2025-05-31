import { notificationEvent, signInLinkEvent } from "./events.js";

export type Method = "GET" | "POST" | "PUT" | "POST" | "DELETE";

export interface FetchConfig {
	method: Method;
	header: HeadersInit;
	body?: any;
	url: string;
}
export const baseUrl = `https://${window.location.hostname}:${window.location.port}`;

export async function fetchPong(config: FetchConfig) {
	const { url, method, header, body } = config;

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
	// const data = await response.json();
	return;
}
