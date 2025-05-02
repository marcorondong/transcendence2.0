import type { FastifyRequest, FastifyReply } from "fastify";

export async function onRequest(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	if (
		request.url === "/auth-api/sign-in" ||
		request.url === "/auth-api/health-check" ||
		request.url === "/"
	) {
		return;
	}
	await request.jwtVerify();
	console.log("JWT Token:", request.user);
}