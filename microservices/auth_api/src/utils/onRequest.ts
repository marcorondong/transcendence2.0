import type { FastifyRequest, FastifyReply } from "fastify";
import { env } from "./env";

// TODO: Later; is very probable that none of USERS requests will be handled by AUTH.
export async function ft_onRequest(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	if (
		request.url === env.AUTH_API_SIGN_IN_STATIC ||
		request.url === env.AUTH_API_SIGN_UP_STATIC ||
		request.url === env.AUTH_API_BOT_JWT_STATIC ||
		request.url === env.AUTH_API_HEALTH_CHECK_STATIC
	)
		return;
	if (request.url.startsWith(env.AUTH_API_DOCUMENTATION_STATIC)) return;
	await request.jwtVerify();
}
