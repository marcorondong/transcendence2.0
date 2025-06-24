import { FastifyRequest, FastifyReply } from "fastify";
import { TokenPayload, loginResponseSchema } from "../modules/user/user.schema";
import { AppError, AUTH_GUARD_ERRORS, AUTH_PRE_HANDLER_ERRORS } from "./errors";
import { logger } from "./logger";
import prisma from "./prisma";

const AUTH_GUARD_ENABLED = true;
const DEV_AUTH_ENABLED = false;
const AUTH_VERIFY_URL =
	"http://auth_api_container:2999/auth-api/verify-connection"; // Adjust according to Docker

// TODO: Check if extend FastifyRequest here or in app.ts as i'm currently doing
// // Extend FastifyRequest with a `authUser` field
// declare module "fastify" {
// 	interface FastifyRequest {
// 		authUser?: TokenPayload;
// 	}
// }

interface AuthenticatedRequest<
	Params = FastifyRequest["params"],
	Body = FastifyRequest["body"],
	Query = FastifyRequest["query"],
> extends FastifyRequest<{ Params: Params; Body: Body; Query: Query }> {
	authUser?: TokenPayload; // Optional, since I'll check for it inside the preHandlers
}

// Authentication hook
export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
	// console.dir(request, { depth: 2 });
	if (!AUTH_GUARD_ENABLED) return;

	logger.debug({
		"event.action": "authGuard hit",
		"url": request.raw.url,
		"method": request.method,
		"cookie": request.headers.cookie,
		"message": "Starting authGuard()",
	});
	// Public paths that never require auth (Exact match: no more extra path nor less)
	const exactPaths = [
		"/api/tools/health-check",
		"/api/users/login",
		"/api/users",
	];
	// Public paths that never require auth (IMPORTANT! startWith match: will match the path + anything extra)
	// E.g: api/documentation/static/swagger-ui.css"
	const prefixPaths = ["/api/tools/swagger", "/api/documentation"];

	const isExactPublicPath = exactPaths.includes(
		(request as any).routerPath ?? "",
	);
	const isPrefixPublicPath = prefixPaths.some((path) =>
		request.raw.url?.startsWith(path),
	);

	const isPublicPath = isExactPublicPath || isPrefixPublicPath;

	const isRouteExempt = request.routeOptions?.config?.authRequired === false;

	if (DEV_AUTH_ENABLED) {
		// Attach info. Make the request pass WITH faked auth info
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
	if (isPublicPath || isRouteExempt) {
		// Don't attach anything. Let the request pass WITHOUT auth info (they're public no no auth is checked)
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
		logger.debug({
			"event.action": "authGuard to verify with AUTH",
			"cookie": cookie,
			"message":
				"Received cookie in real mode; will be verified with AUTH",
		});
		logger.debug(`Attempting AUTH contact at: ${AUTH_VERIFY_URL}`);
		const response = await fetch(AUTH_VERIFY_URL, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Cookie": cookie,
			},
		});
		if (!response.ok) {
			// logger.warn(`Failed AUTH contact at: ${AUTH_VERIFY_URL}`);
			// const errorText = await response.text(); // safe even if not JSON // TODO: I can only read the body once. cannot try .json() after .text()
			logger.warn({
				"event.action": "authGuard",
				"url": AUTH_VERIFY_URL,
				"status": response.status,
				"statusText": response.statusText,
				// "body": errorText,
				"message": "AUTH service responded with failure",
			});
			throw new AppError({
				statusCode: 401,
				code: AUTH_GUARD_ERRORS.INVALID_TOKEN,
				message: "Unauthorized: invalid token",
				handlerName: "authGuard",
			});
		}
		logger.debug(`Successful AUTH contact at: ${AUTH_VERIFY_URL}`);
		const data = await response.json();
		const validated = loginResponseSchema.parse(data); // I should use tokenPayloadSchema but it's not exported and this one is the same
		logger.debug({
			"event.action": "authGuard verified with AUTH",
			"status": response.status,
			"statusText": response.statusText,
			"validated": validated,
			"message": "Parsed token data from AUTH",
		});
		request.user = validated; // for logging via pino
		request.authUser = validated; // for type-safe logic
		logger.debug({
			"event.action": "authGuard",
			"authUser": request.authUser,
			"message": "Final authUser attached to request",
		});
	} catch (err) {
		throw new AppError({
			statusCode: 500,
			code: AUTH_GUARD_ERRORS.UNREACHABLE_AUTH,
			message: "Auth service unreachable",
			handlerName: "authGuard",
		});
	}
}

// Guard that allows only the user to access/modify their own resource.
export async function onlySelf<
	T extends AuthenticatedRequest<{ id: string }> = AuthenticatedRequest<{
		id: string;
	}>,
>(request: T, _reply: FastifyReply) {
	// console.dir(request, { depth: 2 });
	if (!AUTH_GUARD_ENABLED) return;
	logger.debug({
		"event.action": "onlySelf hit",
		"url": request.raw.url,
		"method": request.method,
		"cookie": request.headers.cookie,
		"authUser": request.authUser,
		"params": request.params,
		// "id params": request.id,
		"message": "Attempting onlySelf check",
	});
	const user = request.authUser;
	// If NO user inside the Cookie
	if (!user) {
		throw new AppError({
			statusCode: 401,
			code: AUTH_PRE_HANDLER_ERRORS.USER_INFO_NOT_FOUND,
			message: "Unauthorized: no user info",
			handlerName: "onlySelf",
		});
	}
	// If user id doesn't match the owner of the resource he tries to access
	if (user.id !== request.params.id) {
		throw new AppError({
			statusCode: 403,
			code: AUTH_PRE_HANDLER_ERRORS.FORBIDDEN_RESOURCE,
			// TODO: Later remove the ids part
			message: `Forbidden: not your resource. You have id: ${user.id} | You requested: ${request.params.id}`,
			handlerName: "onlySelf",
		});
	}
	logger.debug({
		"event.action": "onlySelf",
		"idMatch": "params.id",
		"userId": user.id,
		"authUser": request.authUser,
		"message": "onlySelf check succeeded",
	});
}

// <T extends AuthenticatedRequest<any, any, { fromId?: string; toId?: string }> = ...> // Example of how to introduce types in Fastify generics
// Guard that allows access if the authenticated user is: The route param `:id`, or Present in one of the accepted query params (`fromId`, `toId`, etc.)
export function onlyIfInQuery<
	T extends AuthenticatedRequest = AuthenticatedRequest,
>(queryKeys: string[]) {
	if (!AUTH_GUARD_ENABLED) return;
	logger.debug({
		"event.action": "onlyIfInQuery hit",
		"queryKeys": queryKeys,
		"message": "Attempting onlyIfInQuery check",
	});
	// This is a Factory: It returns a preHandler depending on the arguments (e.g: preHandler: onlyIfInQuery(["fromId", "toId"]))
	return async function (request: T, _reply: FastifyReply) {
		// console.dir(request, { depth: 2 });
		const user = request.authUser;
		logger.debug({
			"event.action": "onlyIfInQuery factory function hit",
			"url": request.raw.url,
			"method": request.method,
			"cookie": request.headers.cookie,
			"authUser": user,
			"queryKeys": queryKeys,
			// "id params": request.id,
			"message": "Attempting onlyIfInQuery factory function check",
		});
		// If NO user inside the Cookie
		if (!user) {
			throw new AppError({
				statusCode: 401,
				code: AUTH_PRE_HANDLER_ERRORS.USER_INFO_NOT_FOUND,
				message: "Unauthorized: no user info",
				handlerName: "onlyIfInQuery",
			});
		}
		// Check if :id param matches
		if ((request.params as any)?.id === user.id) {
			logger.debug({
				"event.action": "onlyIfInQuery",
				"idMatch": "params.id",
				"userId": user.id,
				"authUser": request.authUser,
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
				logger.debug({
					"event.action": "onlyIfInQuery",
					"queryMatch": queryMatch ? `query.${key}` : `body.${key}`,
					"userId": user.id,
					"authUser": request.authUser,
					"message": "Authorized by query/body match",
				});
				return; // Authorized
			}
		}
		// Else
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
	if (!AUTH_GUARD_ENABLED) return;
	return async function <
		T extends AuthenticatedRequest<{ id: string }> = AuthenticatedRequest<{
			id: string;
		}>,
	>(request: T, _reply: FastifyReply) {
		// console.dir(request, { depth: 2 });
		logger.debug({
			"event.action": "onlyFriendRequestParticipant hit",
			"url": request.raw.url,
			"method": request.method,
			"cookie": request.headers.cookie,
			"authUser": request.authUser,
			"params": request.params,
			// "params.id": request.params.id,
			"restrictToReceiver": restrictToReceiver,
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
		// This is handled in friend_request.service.ts; but I need to check here too to restrict resource access
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
		logger.debug({
			"event.action": "onlyFriendRequestParticipant",
			"idMatch": "params.id",
			"userId": user.id,
			"authUser": request.authUser,
			"message": "Friend request access granted",
		});
	};
}
