import type { FastifyRequest, FastifyReply } from "fastify";
import { env } from "./env";

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
	try {
		await request.jwtVerify();
	} catch (error) {
		reply.log.warn(
			{ Response: error, url: request.url },
			"JWT verification failed",
		);
		reply.status(401).send({
			statusCode: 401,
			error: "Unauthorized",
			message: "You are not authorized",
		});
		return;
	}
}
