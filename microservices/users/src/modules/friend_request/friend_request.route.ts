import { FastifyInstance } from "fastify";
import {
	acceptFriendRequestHandler,
	deleteFriendRequestHandler,
	getFriendRequestsHandler,
	createFriendRequestHandler,
} from "./friend_request.controller";
import {
	friendRequestIdParamSchema,
	createFriendRequestSchema,
	friendRequestResponseSchema,
	errorResponseSchema,
	friendRequestArrayResponseSchema,
	emptyResponseSchema,
} from "./friend_request.schema";
import { userArrayResponseSchema } from "../user/user.schema";
import { appErrorHandler } from "../../utils/errors";

async function friendRequestRoutes(server: FastifyInstance) {
	// 1. Create a friend request (send a new friend request)
	server.post(
		"/",
		{
			schema: {
				tags: ["Friend Request"],
				summary: "Create a friend request",
				description:
					"Creates a new friend request and sends it to the target user.",
				body: createFriendRequestSchema,
				response: {
					201: friendRequestResponseSchema,
					200: userArrayResponseSchema, // When reverse request is auto-accepted
					400: errorResponseSchema.describe("Bad request"),
					409: errorResponseSchema.describe("Conflict"),
				},
			},
		},
		appErrorHandler(createFriendRequestHandler),
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
		appErrorHandler(getFriendRequestsHandler),
	);
	// 3. Accept a friend request (create new friendship and delete friend request)
	server.post(
		"/:id/accept",
		{
			schema: {
				tags: ["Friend Request"],
				summary: "Accepts a friend request",
				description: "Accepts a friend request.",
				params: friendRequestIdParamSchema,
				response: {
					200: userArrayResponseSchema,
					400: errorResponseSchema.describe("Bad request"),
					404: errorResponseSchema.describe("Not Found"),
				},
			},
		},
		appErrorHandler(acceptFriendRequestHandler),
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
					204: emptyResponseSchema,
					400: errorResponseSchema.describe("Bad request"),
					404: errorResponseSchema.describe("Not Found"),
				},
			},
		},
		appErrorHandler(deleteFriendRequestHandler),
	);
}

export default friendRequestRoutes;
