import { FastifyRequest, FastifyReply } from "fastify";
import { TokenPayload, loginResponseSchema } from "../modules/user/user.schema";
import { AppError, AUTH_GUARD_ERRORS, AUTH_PRE_HANDLER_ERRORS } from "./errors";
import { logger } from "./logger";

const ENABLE_AUTH_GUARD = true;
const IS_DEV_MODE = true;
const AUTH_VERIFY_URL =
	"http://auth_api_container:2999/auth-api/verify-connection"; // Adjust according to Docker

// Extend FastifyRequest with a `authUser` field
declare module "fastify" {
	interface FastifyRequest {
		authUser?: TokenPayload;
	}
}

// Authentication hook
export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
	if (!ENABLE_AUTH_GUARD) return;

	// Public paths that never require auth (centralized)
	const publicPaths: string[] = [
		"/api/tools/health-check",
		"/api/tools/swagger",
		"/api/users",
		"/api/users/login",
	];

	const isPublicPath = publicPaths.some((path) =>
		request.raw.url?.startsWith(path),
	);

	const isRouteExempt = request.routeOptions?.config?.authRequired === false;

	if (IS_DEV_MODE || isPublicPath || isRouteExempt) {
		request.user = {
			id: "00000000-0000-0000-0000-000000000001",
			nickname: "dev-user",
		};
		request.authUser = {
			id: "7d7348af-b918-4f3e-aca7-09722c922fc1",
			nickname: "dev-user",
		};
		logger.log({
			"event.action": "authGuard",
			"authUser": request.authUser,
			"message": "[DEV AUTH] Injected mock user:",
		});
		return;
	}

	const cookie = request.headers.cookie;
	if (!cookie) {
		throw new AppError({
			statusCode: 401,
			code: AUTH_GUARD_ERRORS.COOKIE_NOT_FOUND,
			message: "Unauthorized: missing cookie",
			handlerName: "authGuard",
		});
	}
	try {
		const response = await fetch(AUTH_VERIFY_URL, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Cookie": cookie,
			},
		});
		if (!response.ok) {
			throw new AppError({
				statusCode: 401,
				code: AUTH_GUARD_ERRORS.INVALID_TOKEN,
				message: "Unauthorized: invalid token",
				handlerName: "authGuard",
			});
		}
		const data = await response.json();
		const validated = loginResponseSchema.parse(data); // I should use tokenPayloadSchema but it's not exported and this one is the same
		request.user = validated; // for logging via pino
		request.authUser = validated; // for type-safe logic
	} catch (err) {
		// logger.error(err, "[AUTH ERROR]");
		logger.log({
			"event.action": "authGuard",
			"error": err,
			"message": "[AUTH ERROR]",
		});
		throw new AppError({
			statusCode: 500,
			code: AUTH_GUARD_ERRORS.UNREACHABLE_AUTH,
			message: "Auth service unreachable",
			handlerName: "authGuard",
		});
	}
}

// Guard that allows only the user to access/modify their own resource.
export async function onlySelf(
	request: FastifyRequest<{ Params: { id: string } }>,
	_reply: FastifyReply,
	// reply: FastifyReply,
) {
	logger.log({
		"event.action": "onlySelf",
		"id params": request.id,
		"message": "Attempting onlySelf check",
	});
	const user = request.authUser;
	// If NO user inside the Cookie
	if (!user) {
		// return reply.code(401).send({ message: "Unauthorized: no user info" });
		throw new AppError({
			statusCode: 401,
			code: AUTH_PRE_HANDLER_ERRORS.USER_INFO_NOT_FOUND,
			message: "Unauthorized: no user info",
			handlerName: "onlySelf",
		});
	}
	// If user id doesn't match the owner of the resource he tries to access
	if (user.id !== request.params.id) {
		// return reply
		// 	.code(403)
		// 	.send({ message: "Forbidden: not your resource" });
		throw new AppError({
			statusCode: 403,
			code: AUTH_PRE_HANDLER_ERRORS.FORBIDDEN_RESOURCE,
			message: "Forbidden: not your resource",
			handlerName: "onlySelf",
		});
	}
	logger.log({
		"event.action": "onlySelf",
		"authUser": request.authUser,
		"message": "onlySelf check succeeded",
	});
}

// Guard that allows access if the authenticated user is: The route param `:id`, or Present in one of the accepted query params (`fromId`, `toId`, etc.)
// Guard that allows access if the authenticated user is: The route param `:id`, or Present in one of the accepted query params (`fromId`, `toId`, etc.)
export function onlyIfInQuery<T extends FastifyRequest = FastifyRequest>(
	queryKeys: string[],
) {
	logger.log({
		"event.action": "onlyIfInQuery",
		"queryKeys": queryKeys,
		"message": "Attempting onlyIfInQuery check",
	});
	return async function (request: T, _reply: FastifyReply) {
		const user = (request as FastifyRequest).authUser;

		// If NO user inside the Cookie
		if (!user) {
			// return reply
			// 	.code(401)
			// 	.send({ message: "Unauthorized: no user info" });
			throw new AppError({
				statusCode: 401,
				code: AUTH_PRE_HANDLER_ERRORS.USER_INFO_NOT_FOUND,
				message: "Unauthorized: no user info",
				handlerName: "onlyIfInQuery",
			});
		}
		// Check if :id param matches
		if ((request.params as any)?.id === user.id) return; // Authorized
		// Check query, body, or both for  user's ID
		for (const key of queryKeys) {
			const queryMatch =
				(request.query as Record<string, string | undefined>)?.[key] ===
				user.id;
			const bodyMatch =
				(request.body as Record<string, string | undefined>)?.[key] ===
				user.id;
			if (queryMatch || bodyMatch) return; // Authorized
		}
		// Else
		// return reply.code(403).send({
		// 	message: `Forbidden: user does not match any of [params.id, ${queryKeys.join(
		// 		", ",
		// 	)}]`,
		// });
		throw new AppError({
			statusCode: 403,
			code: AUTH_PRE_HANDLER_ERRORS.FORBIDDEN_QUERY,
			message: `Forbidden: user does not match any of [params.id, ${queryKeys.join(
				", ",
			)}]`,
			handlerName: "onlyIfInQuery",
		});
	};
}

//=========OLD VER02: DIDN'T ONLY CHECK IN QUERY PARAMS (NOT BODY)============//
// export function onlyIfInQuery<T extends FastifyRequest = FastifyRequest>(
// 	queryKeys: string[],
// ) {
// 	logger.log({
// 		"event.action": "onlyIfInQuery",
// 		"queryKeys": queryKeys,
// 		"message": "Attempting onlyIfInQuery check",
// 	});
// 	return async function (request: T, _reply: FastifyReply) {
// 		const user = (request as FastifyRequest).authUser;

// 		// If NO user inside the Cookie
// 		if (!user) {
// 			// return reply
// 			// 	.code(401)
// 			// 	.send({ message: "Unauthorized: no user info" });
// 			throw new AppError({
// 				statusCode: 401,
// 				code: "AUTH_NO_USER",
// 				message: "Unauthorized: no user info",
// 			});
// 		}
// 		// Check if :id param matches
// 		if ((request.params as any)?.id === user.id) return; // Authorized
// 		// Check if query string contains user's ID in accepted keys
// 		for (const key of queryKeys) {
// 			if ((request.query as Record<string, string>)[key] === user.id) {
// 				return; // Authorized
// 			}
// 		}
// 		// Else
// 		// return reply.code(403).send({
// 		// 	message: `Forbidden: user does not match any of [params.id, ${queryKeys.join(
// 		// 		", ",
// 		// 	)}]`,
// 		// });
// 		throw new AppError({
// 			statusCode: 403,
// 			code: "AUTH_FORBIDDEN_QUERY",
// 			message: `Forbidden: user does not match any of [params.id, ${queryKeys.join(
// 				", ",
// 			)}]`,
// 		});
// 	};
// }

//=======================OLD VER01: DIDN'T USE TEMPLATE=======================//
// export function onlyIfInQuery(queryKeys: string[]) {
// 	return async function (
// 		request: FastifyRequest<{ Params: { id?: string } }>,
// 		_reply: FastifyReply,
// 		// reply: FastifyReply,
// 	) {
// 		const user = request.authUser;
// 		// If NO user inside the Cookie
// 		if (!user) {
// 			// return reply
// 			// 	.code(401)
// 			// 	.send({ message: "Unauthorized: no user info" });
// 			throw new AppError({
// 				statusCode: 401,
// 				code: "AUTH_NO_USER",
// 				message: "Unauthorized: no user info",
// 			});
// 		}
// 		// Check if :id param matches
// 		if (request.params?.id === user.id) return; // Authorized
// 		// Check if query string contains user's ID in accepted keys
// 		for (const key of queryKeys) {
// 			if ((request.query as Record<string, string>)[key] === user.id) {
// 				return; // Authorized
// 			}
// 		}
// 		// Else
// 		// return reply.code(403).send({
// 		// 	message: `Forbidden: user does not match any of [params.id, ${queryKeys.join(
// 		// 		", ",
// 		// 	)}]`,
// 		// });
// 		throw new AppError({
// 			statusCode: 403,
// 			code: "AUTH_FORBIDDEN_QUERY",
// 			message: `Forbidden: user does not match any of [params.id, ${queryKeys.join(
// 				", ",
// 			)}]`,
// 		});
// 	};
// }
