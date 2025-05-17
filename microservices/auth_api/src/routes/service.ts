import httpError from "http-errors";
import { payloadZodSchema } from "./zodSchemas";

export async function signInRequest(  // TODO update signInRequest to use username instead of email when users service is updated
	email: string,
	password: string,
) {
	const response = await fetch("http://users:3000/api/users/login", {
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
