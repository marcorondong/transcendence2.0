import type { FastifyRequest, FastifyReply } from "fastify";
import { env } from "./env";
import { clearCookieOpt } from "../routes/configs";
import { getUserRequest } from "../routes/httpRequests";

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
		const response = await getUserRequest(request.user.id, request);
		if (!response.ok) {
			const data = await response.json();
			reply.log.warn(
				{ Response: data, User: request.user },
				"getUserRequest() response not ok",
			);
			reply.clearCookie(env.JWT_TOKEN_NAME, clearCookieOpt);
			return reply.status(data.statusCode || 500).send(data);
		}
	} catch (error) {
		reply.log.warn(
			{ Response: error, url: request.url },
			"JWT verification failed",
		);
		reply.clearCookie(env.JWT_TOKEN_NAME, clearCookieOpt);
		reply.status(401).send({
			statusCode: 401,
			error: "Unauthorized",
			message: "You are not authorized",
		});
		return;
	}
}
