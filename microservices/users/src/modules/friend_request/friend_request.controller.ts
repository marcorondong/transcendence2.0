import { FastifyRequest, FastifyReply } from "fastify";
import {
	createFriendRequest,
	findFriendRequestByUnique,
	acceptFriendRequest,
	deleteFriendRequest,
	findFriendRequests,
} from "./friend_request.service";
import {
	CreateFriendRequestInput,
	friendRequestResponseSchema,
	friendRequestArrayResponseSchema,
	getFriendRequestsQuery,
} from "./friend_request.schema";
import { userArrayResponseSchema } from "../user/user.schema";
import { AppError, FRIEND_REQUEST_ERRORS } from "../../utils/errors";
import getConfig from "../../utils/config";
import { logger } from "../../utils/logger";

export async function createFriendRequestHandler(
	request: FastifyRequest<{ Body: CreateFriendRequestInput }>,
	reply: FastifyReply,
) {
	logger.debug({
		"event.action": "Create Friend User",
		"fromId": request.body.fromId,
		"toId": request.body.toId,
		"msg": request.body.message,
		"message": "createFriendRequestHandler hit",
	});
	const { fromId, toId, message } = request.body;
	const result = await createFriendRequest(fromId, toId, message);

	// If it was auto-accepted,
	if (Array.isArray(result)) {
		// Reverse request was auto-accepted; return befriended users (200 OK, instead of 201 friend request created)
		const parsed = userArrayResponseSchema.parse(result);
		return reply.code(200).send(parsed);
	}
	// Otherwise return the created friend request
	const parsed = friendRequestResponseSchema.parse(result);
	return reply.code(201).send(parsed);
}

export async function getFriendRequestHandler(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	logger.debug({
		"event.action": "Get sigle Friend Request",
		"message": "getFriendRequestHandler hit",
	});
	const friendRequest = await findFriendRequestByUnique({
		id: request.params.id,
	});
	const parsed = friendRequestResponseSchema.parse(friendRequest);
	return reply.code(200).send(parsed);
}

// Helper function for pagination
function applyPagination(params: {
	all?: boolean;
	skip?: number;
	take?: number;
	page?: number;
}) {
	// logger.debug({
	// 	"event.action": "applyPagination",
	// 	"params": params,
	// 	"message": "[applyPagination] Raw params",
	// });

	// Get config from utils function getConfig() (utils/config.ts)
	const config = getConfig();
	const paginationEnabled = config.PAGINATION_ENABLED === "true";
	const defaultPageSize = parseInt(config.DEFAULT_PAGE_SIZE || "10", 10);

	// If query string has "?all=true" then all results will be provided (no pagination)
	if (params.all === true || !paginationEnabled) {
		return { skip: undefined, take: undefined };
	}

	const take =
		typeof params.take === "number" ? params.take : defaultPageSize;

	// Enforce that both `page` and `skip` are not allowed together
	if (typeof params.page === "number" && typeof params.skip === "number") {
		// TODO: Use AppError here
		// throw new Error("Cannot use both 'page' and 'skip' in the same query");
		throw new AppError({
			statusCode: 400,
			code: FRIEND_REQUEST_ERRORS.INVALID_QUERY,
			// handlerName: "applyPagination",
			message: "Cannot use both 'page' and 'skip' in the same query",
		});
		// Comment out the line above to disable this validation
	}

	const skip =
		typeof params.page === "number"
			? (params.page - 1) * take
			: typeof params.skip === "number"
			? params.skip
			: 0;

	return { skip, take };
}

export async function getFriendRequestsHandler(
	request: FastifyRequest<{ Querystring: getFriendRequestsQuery }>,
	reply: FastifyReply,
) {
	// Log full query for debugging purposes
	logger.debug({
		"event.action": "Get Friend Request - query params",
		"query": request.query,
		"message": "getFriendRequestsHandler hit",
	});
	// Destructure request query into respective fields
	const {
		id,
		fromId,
		toId,
		message,
		createdAt,
		before,
		after,
		between,
		useFuzzy,
		useOr,
		filterIds,
		skip: querySkip,
		take: queryTake,
		page,
		all,
		sortBy,
		order,
	} = request.query;

	const { skip, take } = applyPagination({
		all,
		skip: querySkip,
		take: queryTake,
		page,
	});
	// Log pagination results for debugging purposes
	// logger.debug({
	// 	"event.action": "applyPagination",
	// 	"page": page,
	// 	"skip": skip,
	// 	"take": take,
	// 	"all": all,
	// 	"message": "[Pagination]",
	// });

	// MR_NOTE: 'page' nor 'all' field aren't handled by service `findUsers()`;
	// since pagination is an abstraction for 'skip' and 'take'
	const friendRequests = await findFriendRequests({
		where: {
			id,
			fromId,
			toId,
			message,
			createdAt,
		},
		useFuzzy,
		useOr,
		filterIds,
		before,
		after,
		between,
		skip,
		take,
		sortBy,
		order,
	});

	const parsed = friendRequestArrayResponseSchema.parse(friendRequests);
	return reply.code(200).send(parsed);
}

export async function acceptFriendRequestHandler(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	logger.debug({
		"event.action": "Accept Friend Request",
		"message": "acceptFriendRequestHandler hit",
	});
	const { id } = request.params;
	const users = await acceptFriendRequest(id);
	const parsed = userArrayResponseSchema.parse(users);
	return reply.code(200).send(parsed);
}

export async function deleteFriendRequestHandler(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	logger.debug({
		"event.action": "Reject Friend Request",
		"message": "deleteFriendRequestHandler hit",
	});
	const { id } = request.params;
	await deleteFriendRequest(id);
	return reply.code(204).send();
}
