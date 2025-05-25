import httpError from "http-errors";
import { payloadZodSchema } from "./zodSchemas";
import { env } from "../utils/env";

export async function signInRequest(email: string, password: string) {
	// TODO update signInRequest to use username instead of email when users service is updated
	const response = await fetch(env.USERS_LOGIN_REQUEST_DOCKER, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, password }),
	});
	if (!response.ok) {
		throw new httpError.Unauthorized("Invalid email or password");
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
