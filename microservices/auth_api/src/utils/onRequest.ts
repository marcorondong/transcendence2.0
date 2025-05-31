import type { FastifyRequest, FastifyReply, FastifyError } from "fastify";
import { env } from "./env";

// export const jwtVerifyOpt = {
// 	// ignoreExpiration: false,
// 	// issuer: "auth_api",
// 	// iss: "auth_api",
// 	// audience: "users",
// 	// aud: "users",
// 	// allowedAud: "users",
// 	// allowedIss: "auth_api",
// 	// jwtid: "auth_api",
// 	// keyid: "auth_api",
// 	// subject: "auth_api",
// 	// algorithm: "HS256",
// 	// customClaim: "customClaimValue",
// 	// algorithms: ["HS256"],
// };

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
