import httpError from "http-errors";

export async function signIn(
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
		return false;
	}
	return true;
}
