import type { FastifyRequest, FastifyReply } from "fastify";

export async function onRequest(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	if (
		request.url === "/auth-api/sign-in" ||
		request.url === "/auth-api/health-check"
	)
		return;
	if (request.url.startsWith('/auth-api/documentation'))
		return;
	await request.jwtVerify();
}