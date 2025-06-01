import httpError from "http-errors";
import { env } from "../utils/env";

export async function signInRequest(body: unknown) {
	const response = await fetch(env.USERS_LOGIN_REQUEST_DOCKER, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
	if (!response.ok) {
		const raw = await response.json();
		throw httpError(
			raw.statusCode || 500,
			raw.message || "An error occurred while signing in",
			{ name: raw.error || "SignIn Error" },
		);
	}
	const data = await response.json();
	const payload = { id: data.id, nickname: data.nickname };
	return payload;
}

export async function signUpRequest(body: unknown) {
	const response = await fetch(env.USERS_REGISTRATION_REQUEST_DOCKER, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
	if (!response.ok) {
		const raw = await response.json();
		throw httpError(
			raw.statusCode || 500,
			raw.message || "An error occurred while signing up",
			{ name: raw.error || "SignUp Error" },
		);
	}
	const data = await response.json();
	const payload = { id: data.id, nickname: data.nickname };
	return payload;
}

export async function editProfileRequest(body: unknown, userId: unknown) {
	const response = await fetch(
		`${env.USERS_REQUEST_DOCKER}${userId}`,
		{
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		},
	);
	if (!response.ok) {
		const raw = await response.json();
		throw httpError(
			raw.statusCode || 500,
			raw.message || "An error occurred while editing profile",
			{ name: raw.error || "EditProfile Error" },
		);
	}
	const data = await response.json();
	const payload = { id: data.id, nickname: data.nickname };
	return payload;
}

export async function updateProfileRequest(body: unknown, userId: unknown) {
	const response = await fetch(
		`${env.USERS_REQUEST_DOCKER}${userId}`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		},
	);
	if (!response.ok) {
		const raw = await response.json();
		throw httpError(
			raw.statusCode || 500,
			raw.message || "An error occurred while updating profile",
			{ name: raw.error || "UpdateProfile Error" },
		);
	}
	const data = await response.json();
	const payload = { id: data.id, nickname: data.nickname };
	return payload;
}

export async function deleteUserRequest(userId: unknown) {
	const response = await fetch(`${env.USERS_REQUEST_DOCKER}${userId}`, {
		method: "DELETE",
	});
	if (!response.ok) {
		const raw = await response.json();
		throw httpError(
			raw.statusCode || 500,
			raw.message || "An error occurred while deleting user",
			{ name: raw.error || "DeleteUser Error" },
		);
	}
}