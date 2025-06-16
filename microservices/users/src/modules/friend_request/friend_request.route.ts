import { FastifyInstance } from "fastify";
import {
	acceptFriendRequestHandler,
	deleteFriendRequestHandler,
	getFriendRequestsHandler,
	sendFriendRequestHandler,
} from "./friend_request.controller";
import {
	friendRequestIdParamSchema,
	acceptFriendRequestBodySchema,
	sendFriendRequestSchema,
	friendRequestResponseSchema,
	errorResponseSchema,
	friendRequestArrayResponseSchema,
} from "./friend_request.schema";
import { errorHandler } from "../../utils/errors";

async function friendRequestRoutes(server: FastifyInstance) {
	// 1. Send a friend request (create a new friend request)
	server.post(
		"/",
		{
			schema: {
				tags: ["Friend Request"],
				summary: "Send a friend request",
				description:
					"Creates a new friend request and sends it to the target user.",
				body: sendFriendRequestSchema,
				response: {
					201: friendRequestResponseSchema,
					400: errorResponseSchema.describe("Bad request"),
					409: errorResponseSchema.describe("Conflict"),
				},
			},
		},
		errorHandler(sendFriendRequestHandler),
	);
	// 2. Get all friend requests //TODO: filter/sort/paginate ?
	server.get(
		"/",
		{
			schema: {
				tags: ["Friend Request"],
				summary: "Get all friend requests",
				description: "Gets all friend request.",
				response: {
					200: friendRequestArrayResponseSchema,
					400: errorResponseSchema.describe("Bad request"),
					404: errorResponseSchema.describe("Not Found"),
				},
			},
		},
		errorHandler(getFriendRequestsHandler),
	);
	// 3. Accept a friend request (create new friendship and delete friend request)
	server.post(
		// TODO: Remove the accept or reformat the logic to use url instead of body
		"/:id/accept",
		{
			schema: {
				tags: ["Friend Request"],
				summary: "Accepts a friend request",
				description: "Accepts a friend request.",
				params: friendRequestIdParamSchema,
				body: acceptFriendRequestBodySchema,
				response: {
					201: friendRequestResponseSchema,
					400: errorResponseSchema.describe("Bad request"),
					404: errorResponseSchema.describe("Not Found"),
				},
			},
		},
		errorHandler(acceptFriendRequestHandler),
	);
	// 4. Reject a friend request (delete friend request)
	server.delete(
		"/:id",
		{
			schema: {
				tags: ["Friend Request"],
				summary: "Reject a friend request",
				description: "Rejects a friend request and deletes it.",
				params: friendRequestIdParamSchema,
				response: {
					204: friendRequestResponseSchema,
					400: errorResponseSchema.describe("Bad request"),
					404: errorResponseSchema.describe("Not Found"),
				},
			},
		},
		errorHandler(deleteFriendRequestHandler),
	);
}

export default friendRequestRoutes;
