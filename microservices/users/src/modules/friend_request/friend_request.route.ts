import { FastifyInstance } from "fastify";
import {
	acceptFriendRequestHandler,
	deleteFriendRequestHandler,
	getFriendRequestsHandler,
	createFriendRequestHandler,
	getFriendRequestHandler,
} from "./friend_request.controller";
import {
	friendRequestIdParamSchema,
	CreateFriendRequestInput,
	createFriendRequestSchema,
	friendRequestResponseSchema,
	errorResponseSchema,
	friendRequestArrayResponseSchema,
	emptyResponseSchema,
	getFriendRequestsQuerySchema,
	getFriendRequestsQuery,
} from "./friend_request.schema";
import { userArrayResponseSchema } from "../user/user.schema";
import { appErrorHandler } from "../../utils/errors";
import {
	onlyFriendRequestParticipant,
	onlyIfInQuery,
} from "../../utils/authGuard";

async function friendRequestRoutes(server: FastifyInstance) {
	// 1. Create a friend request (send a new friend request)
	server.post<{ Body: CreateFriendRequestInput }>(
		"/",
		{
			preHandler: onlyIfInQuery(["fromId", "toId"]), //* Private user route. Only user with ID match (cookieJWT <-> database) can access it
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
	// 2. Get all friend requests
	server.get<{ Querystring: getFriendRequestsQuery }>(
		"/",
		{
			preHandler: onlyIfInQuery(["fromId", "toId"]), //* Private user route. Only user with ID match (cookieJWT <-> database) can access it
			schema: {
				tags: ["Friend Request"],
				summary: "Get all friend requests",
				description:
					"Supports filtering, sorting, and pagination via query params.",
				querystring: getFriendRequestsQuerySchema,
				response: {
					200: friendRequestArrayResponseSchema,
					400: errorResponseSchema.describe("Bad request"),
					404: errorResponseSchema.describe("Not Found"),
				},
			},
		},
		appErrorHandler(getFriendRequestsHandler),
	);
	// 3. Get a single friend request by ID
	server.get<{ Params: { id: string } }>(
		"/:id",
		{
			preHandler: onlyFriendRequestParticipant(), //* Private user route. Only user with ID match (cookieJWT <-> database) can access it
			schema: {
				tags: ["Friend Request"],
				summary: "Get a friend request by ID",
				description:
					"Returns a single friend request matching the given UUID.",
				params: friendRequestIdParamSchema,
				response: {
					200: friendRequestResponseSchema,
					400: errorResponseSchema.describe("Bad request"),
					404: errorResponseSchema.describe("Not Found"),
				},
			},
		},
		appErrorHandler(getFriendRequestHandler),
	);
	// 4. Accept a friend request (create new friendship and delete friend request)
	server.post<{ Params: { id: string } }>(
		"/:id/accept",
		{
			preHandler: onlyFriendRequestParticipant(true), //* Private user route. Only user with ID match (cookieJWT <-> database) can access it
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
	server.delete<{ Params: { id: string } }>(
		"/:id",
		{
			preHandler: onlyFriendRequestParticipant(), //* Private user route. Only user with ID match (cookieJWT <-> database) can access it
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
