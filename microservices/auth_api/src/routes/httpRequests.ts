import { env } from "../utils/env";
import type { FastifyRequest } from "fastify";

export async function signInRequest(body: unknown) {
	const response = await fetch(env.USERS_LOGIN_REQUEST_DOCKER, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
	return response;
}

export async function signUpRequest(body: unknown) {
	const response = await fetch(env.USERS_REGISTRATION_REQUEST_DOCKER, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
	return response;
}

export async function getUserRequest(userId: unknown, request: FastifyRequest) {
	const cookie = request.headers.cookie || "invalid_cookie";
	const response = await fetch(`${env.USERS_REQUEST_DOCKER}${userId}`, {
		method: "GET",
		headers: {
			Cookie: cookie,
		},
	});
	return response;
}

// This function is not in use and commented out in routes.ts
export async function editProfileRequest(body: unknown, userId: unknown) {
	const response = await fetch(`${env.USERS_REQUEST_DOCKER}${userId}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
	return response;
}

// This function is not in use and commented out in routes.ts
export async function updateProfileRequest(body: unknown, userId: unknown) {
	const response = await fetch(`${env.USERS_REQUEST_DOCKER}${userId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
	return response;
}

// This function is not in use and commented out in routes.ts
export async function deleteUserRequest(userId: unknown) {
	const response = await fetch(`${env.USERS_REQUEST_DOCKER}${userId}`, {
		method: "DELETE",
	});
	return response;
}
