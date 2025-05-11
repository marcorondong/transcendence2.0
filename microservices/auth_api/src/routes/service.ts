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
