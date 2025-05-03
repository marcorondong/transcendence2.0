import httpError from "http-errors";
import { payloadZodSchema } from "./zodSchemas";

export async function signInRequest(
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
		console.log("Response not ok", response.status);
		throw new httpError.Unauthorized("Invalid email or password");
	}
	const data = await response.json();
	// if (!data.success) {
	// 	throw new httpError.Unauthorized("Invalid emailllll or password");
	// }
	const payload = data; //payloadZodSchema.parse(data); // TODO once it works in Marco side, append the payloadZodSchema
	return payload;
}
