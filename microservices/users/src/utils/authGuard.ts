import { FastifyRequest, FastifyReply } from "fastify";
import { TokenPayload, loginResponseSchema } from "../modules/user/user.schema";
import { AppError, AUTH_GUARD_ERRORS, AUTH_PRE_HANDLER_ERRORS } from "./errors";
import { logger } from "./logger";
import prisma from "./prisma";

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
			id: "8e2f7a60-1697-44b1-b777-a52562fe5990",
			nickname: "dev-user",
		};
		logger.info({
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
		// logger.error({
		// 	"event.action": "authGuard",
		// 	"error": err,
		// 	"message": "[AUTH ERROR]",
		// });
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
	if (!ENABLE_AUTH_GUARD) return;
	logger.info({
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
			// TODO: Later remove the ids part
			message: `Forbidden: not your resource. You have id: ${user.id} | You requested: ${request.params.id}`,
			handlerName: "onlySelf",
		});
	}
	logger.info({
		"event.action": "onlySelf",
		"match": "params.id",
		"authUser": request.authUser,
		"userId": user.id,
		"message": "onlySelf check succeeded",
	});
}

// Guard that allows access if the authenticated user is: The route param `:id`, or Present in one of the accepted query params (`fromId`, `toId`, etc.)
export function onlyIfInQuery<T extends FastifyRequest = FastifyRequest>(
	queryKeys: string[],
) {
	if (!ENABLE_AUTH_GUARD) return;
	logger.info({
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
		if ((request.params as any)?.id === user.id) {
			logger.info({
				"event.action": "onlyIfInQuery",
				"match": "params.id",
				"userId": user.id,
				"message": "Authorized by param match",
			});
			return; // Authorized
		}
		// Check query, body, or both for  user's ID
		for (const key of queryKeys) {
			const queryMatch =
				(request.query as Record<string, string | undefined>)?.[key] ===
				user.id;
			const bodyMatch =
				(request.body as Record<string, string | undefined>)?.[key] ===
				user.id;
			if (queryMatch || bodyMatch) {
				logger.info({
					"event.action": "onlyIfInQuery",
					"match": queryMatch ? `query.${key}` : `body.${key}`,
					"userId": user.id,
					"message": "Authorized by query/body match",
				});
				return; // Authorized
			}
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
			// TODO: Later remove the ids part
			message: `Forbidden: User with id ${
				user.id
			} does not match any of [params.id, ${queryKeys.join(", ")}]`,
			handlerName: "onlyIfInQuery",
		});
	};
}

// Guard that restricts access to participants of a specific FriendRequest
export function onlyFriendRequestParticipant(restrictToReceiver = false) {
	if (!ENABLE_AUTH_GUARD) return;
	return async function (
		request: FastifyRequest<{ Params: { id: string } }>,
		_reply: FastifyReply,
	) {
		logger.info({
			"event.action": "onlyFriendRequestParticipant",
			"params.id": request.params.id,
			"restrictToReceiver": restrictToReceiver,
			"authUser": request.authUser,
			"message": "Attempting onlyFriendRequestParticipant check",
		});
		const user = request.authUser;
		const friendReqId = request.params.id;
		// If NO user inside the Cookie
		if (!user) {
			throw new AppError({
				statusCode: 401,
				code: AUTH_PRE_HANDLER_ERRORS.USER_INFO_NOT_FOUND,
				message: "Unauthorized: no user info",
				handlerName: "onlyFriendRequestParticipant",
			});
		}
		// Get friend request by ID
		const friendRq = await prisma.friendRequest.findUnique({
			where: { id: friendReqId },
			select: { fromId: true, toId: true },
		});
		// This is handled in friend_request.service.ts; but i need to check here too to restrict access
		if (!friendRq) {
			throw new AppError({
				statusCode: 404,
				code: AUTH_PRE_HANDLER_ERRORS.RESOURCE_NOT_FOUND,
				message: "Friend request not found",
				handlerName: "onlyFriendRequestParticipant",
			});
		}
		// Check if user id is part of the friend request
		const isParticipant =
			friendRq.fromId === user.id || friendRq.toId === user.id;
		if (
			!isParticipant ||
			(restrictToReceiver && user.id !== friendRq.toId)
		) {
			throw new AppError({
				statusCode: 403,
				code: AUTH_PRE_HANDLER_ERRORS.FORBIDDEN_RESOURCE,
				message: "Forbidden: Not authorized for this friend request",
				handlerName: "onlyFriendRequestParticipant",
			});
		}
		logger.info({
			"event.action": "onlyFriendRequestParticipant",
			"authUser": request.authUser,
			"message": "Friend request access granted",
		});
	};
}
