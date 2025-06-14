import { FetchConfig } from "../types/Fetch.js";
import { signInLinkEvent } from "./events.js";

export const baseUrl = `https://${window.location.hostname}:${window.location.port}`;

export async function fetchPong<T = unknown>(config: FetchConfig<T>) {
	const { url, method, headers, body, form, validator } = config;

	const finalBody = body ? JSON.stringify(body) : form;
	const response = await fetch(baseUrl + url, {
		method,
		headers,
		body: finalBody,
	});

	if (!response.ok) {
		// document.dispatchEvent(notificationEvent(response.statusText, "error"));
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
