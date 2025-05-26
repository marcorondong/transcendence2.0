import type { FastifyRequest, FastifyReply } from "fastify";
import { env } from "./env";

export async function ft_onRequest(request: FastifyRequest, reply: FastifyReply) {
	if (
		request.url === env.AUTH_API_SIGN_IN_STATIC ||
		request.url === env.AUTH_API_SIGN_UP_STATIC ||
		request.url === env.AUTH_API_HEALTH_CHECK_STATIC
	)
		return;
	if (request.url.startsWith(env.AUTH_API_DOCUMENTATION_STATIC)) return;
	await request.jwtVerify();
}
