import httpError from "http-errors";
import { payloadZodSchema } from "./zodSchemas";
import { env } from "../utils/env";

export async function signInRequest(username: string, password: string) {
	const response = await fetch(env.USERS_LOGIN_REQUEST_DOCKER, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ username, password }),
	});
	if (!response.ok) {
		if (response.status === 401) {
			throw new httpError.Unauthorized("Invalid email or password");
		} else if (response.status === 400) {
			throw new httpError.BadRequest("Invalid input data");
		}
		throw new httpError.InternalServerError(
			"An error occurred while signing in",
		);
	}
	const data = await response.json();
	const payload = payloadZodSchema.parse(data);
	return payload;
}

export async function signUpRequest(
	email: string,
	nickname: string,
	username: string,
	password: string,
) {
	const response = await fetch(env.USERS_REGISTRATION_REQUEST_DOCKER, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, nickname, username, password }),
	});
	if (!response.ok) {
		if (response.status === 409) {
			throw new httpError.Conflict("User already exists");
		} else if (response.status === 400) {
			throw new httpError.BadRequest("Invalid input data");
		}
		throw new httpError.InternalServerError(
			"An error occurred while signing up",
		);
	}
	const data = await response.json();
	const payload = payloadZodSchema.parse(data);
	return payload;
}

export const setCookieOpt = {
	path: "/",
	httpOnly: true,
	secure: true,
	sameSite: "strict" as const,
	maxAge: 60 * 60,
	signed: true,
};

export const jwtSignOpt = {
	expiresIn: "1h",
	// issuer: "auth_api",
	// audience: "users",
	// algorithm: "HS256",
	// subject: "auth_api",
	// jwtid: "auth_api",
	// notBefore: '10s',
	// customClaim: "customClaim",
};

export const clearCookieOpt = {
	path: "/",
};
