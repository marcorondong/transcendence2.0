import { FastifyInstance } from "fastify";
import {
	registerUserHandler,
	loginHandler,
	getUsersHandler,
	getUserHandler,
	putUserHandler,
	patchUserHandler,
	deleteUserHandler,
	pictureHandler,
	getFriendsHandler,
	addFriendHandler,
	deleteFriendHandler,
	getBlockedUsersHandler,
	blockUserHandler,
	unblockUserHandler,
} from "./user.controller";
import {
	createUserSchema,
	userResponseSchema,
	loginSchema,
	loginResponseSchema,
	userArrayResponseSchema,
	userIdParamSchema,
	getUsersQuerySchema,
	putUserSchema,
	patchUserSchema,
	addFriendSchema,
	targetUserIdParamSchema,
	emptyResponseSchema,
	errorResponseSchema,
	blockUserSchema,
	updateUserPutInput,
	updateUserPatchInput,
	getUsersQuery,
	addFriendInput,
	blockUserInput,
	createUserInput,
	loginInput,
} from "./user.schema";
import { appErrorHandler } from "../../utils/errors";
import { onlySelf } from "../../utils/authGuard";
// import { z } from "zod";

// Helper function for SWagger to define common errors messages and assign them to Swagger UI examples
// Redefinition of error messages in the caller is possible
// TODO: Implement zod-to-openapi later. But for the moment, examples would need to be set manually
// export function withCommonErrors(schema: Record<number, z.ZodTypeAny>) {
// 	return {
// 		...schema,
// 		400: errorResponseSchema.describe("Bad request due to invalid input"),
// 		401: errorResponseSchema.describe(
// 			"Unauthorized or invalid credentials",
// 		),
// 		404: errorResponseSchema.describe("Resource not found"),
// 		409: errorResponseSchema.describe(
// 			"Conflict due to possible value uniqueness violation",
// 		),
// 	};
// }

// MR_NOTE:
// The functions definition is this: server.get(path, options, handler); (3 arguments)
// Expected response structure and status code for Fastify to validate responses (against Zod schemas).
// To validate request/response structure must match schema (Fastify/Zod enforcement).

// TODO: Add examples for the error responses (maybe easier when implementing zod-to-openapi)

async function userRoutes(server: FastifyInstance) {
	// 1. Create a new user
	server.post<{
		Body: createUserInput;
	}>(
		"/",
		{
			schema: {
				tags: ["Users"],
				summary: "Register a new user",
				description:
					"Creates a new user and returns the created user object.",
				body: createUserSchema,
				response: {
					201: userResponseSchema,
					400: errorResponseSchema.describe("Bad request"),
					409: errorResponseSchema.describe("Conflict"),
				},
				// response: withCommonErrors({
				// 	201: userResponseSchema,
				// }),
			},
			config: { authRequired: false }, // Remove authentication (this route is public/exposed)
		},
		appErrorHandler(registerUserHandler),
	);

	// 2. Log in to get authorization token (to access private/authenticated routes)
	server.post<{
		Body: loginInput;
	}>(
		"/login",
		{
			schema: {
				tags: ["Users"],
				summary: "Authenticate a user and return token payload",
				description:
					"Verifies credentials using either email or username, and returns token payload used by the Auth service.",
				body: loginSchema,
				response: {
					200: loginResponseSchema,
					400: errorResponseSchema.describe("Bad request"),
					401: errorResponseSchema.describe("Unauthorized"),
				},
				// response: withCommonErrors({
				// 	200: loginResponseSchema,
				// }),
			},
			config: { authRequired: false }, // Remove authentication (this route is public/exposed)
		},
		appErrorHandler(loginHandler),
	);

	// 3. Get all users (filter/sort/paginate)
	server.get<{
		Querystring: getUsersQuery;
	}>(
		"/",
		{
			schema: {
				tags: ["Users"],
				summary: "Get all users",
				description:
					"Supports filtering, sorting, and pagination via query params.",
				querystring: getUsersQuerySchema,
				response: {
					200: userArrayResponseSchema,
					400: errorResponseSchema.describe("Bad request"),
					404: errorResponseSchema.describe("Not Found"),
				},
				// response: withCommonErrors({
				// 	200: userArrayResponseSchema,
				// }),
			},
		},
		appErrorHandler(getUsersHandler),
	);

	// 4. Get a single user by ID
	server.get<{ Params: { id: string } }>(
		"/:id",
		{
			// preHandler: onlySelf, // TODO Should this one be private user route?
			schema: {
				tags: ["Users"],
				summary: "Get a user by ID",
				description: "Returns a single user matching the given UUID.",
				params: userIdParamSchema,
				response: {
					200: userResponseSchema,
					400: errorResponseSchema.describe("Bad request"),
					404: errorResponseSchema.describe("Not Found"),
				},
				// response: withCommonErrors({
				// 	200: userResponseSchema,
				// }),
			},
		},
		appErrorHandler(getUserHandler),
	);

	// 5. Update ALL user fields (PUT)
	server.put<{
		Params: { id: string };
		Body: updateUserPutInput;
	}>(
		"/:id",
		{
			preHandler: onlySelf, //* Private user route. Only user with ID match (cookieJWT <-> database) can access it
			schema: {
				tags: ["Users"],
				summary: "Update all user fields",
				description: "Replaces the entire user object by ID.",
				params: userIdParamSchema,
				body: putUserSchema,
				response: {
					200: userResponseSchema,
					400: errorResponseSchema.describe("Bad request"),
					404: errorResponseSchema.describe("Not Found"),
					409: errorResponseSchema.describe("Conflict"),
				},
				// response: withCommonErrors({
				// 	200: userResponseSchema,
				// }),
			},
		},
		appErrorHandler(putUserHandler),
	);

	// 6. Update SOME user fields (PATCH)
	server.patch<{
		Params: { id: string };
		Body: updateUserPatchInput;
	}>(
		"/:id",
		{
			preHandler: onlySelf, //* Private user route. Only user with ID match (cookieJWT <-> database) can access it
			schema: {
				tags: ["Users"],
				summary: "Update partial user fields",
				description: "Updates one or more fields of a user by ID.",
				params: userIdParamSchema,
				body: patchUserSchema,
				response: {
					200: userResponseSchema,
					400: errorResponseSchema.describe("Bad request"),
					404: errorResponseSchema.describe("Not Found"),
					409: errorResponseSchema.describe("Conflict"),
				},
				// response: withCommonErrors({
				// 	200: userResponseSchema,
				// }),
			},
		},
		appErrorHandler(patchUserHandler),
	);

	// 7. Delete a user by ID
	server.delete<{ Params: { id: string } }>(
		"/:id",
		{
			preHandler: onlySelf, //* Private user route. Only user with ID match (cookieJWT <-> database) can access it
			schema: {
				tags: ["Users"],
				summary: "Delete a user by ID",
				description:
					"Deletes the specified user and returns no content.",
				params: userIdParamSchema,
				response: {
					204: emptyResponseSchema,
					400: errorResponseSchema.describe("Bad request"),
					404: errorResponseSchema.describe("Not Found"),
				},
				// response: withCommonErrors({
				// 	204: emptyResponseSchema,
				// }),
			},
		},
		appErrorHandler(deleteUserHandler),
	);

	// 8. Update user picture by ID
	server.put<{ Params: { id: string } }>(
		"/:id/picture",
		{
			preHandler: onlySelf, //* Private user route. Only user with ID match (cookieJWT <-> database) can access it
			schema: {
				tags: ["Users"],
				summary: " Update user picture by ID",
				description:
					"Accepts multipart/form-data with a 'picture' file. Replaces any existing user picture.",
				params: userIdParamSchema,
				// requestBody: {
				// 	required: true,
				// 	content: {
				// 		"multipart/form-data": {
				// 			schema: {
				// 				type: "object",
				// 				properties: {
				// 					picture: {
				// 						type: "string",
				// 						format: "binary",
				// 					},
				// 				},
				// 				required: ["picture"],
				// 			},
				// 		},
				// 	},
				// },
				response: {
					200: userResponseSchema,
					400: errorResponseSchema.describe("Bad request"),
					404: errorResponseSchema.describe("Not Found"),
				},
				// response: withCommonErrors({
				// 	204: emptyResponseSchema,
				// }),
				consumes: ["multipart/form-data"], // Enable file upload support in Swagger UI (by default is 'application/json')
			},
		},
		appErrorHandler(pictureHandler),
	);

	// 9. Get all user friends by ID
	server.get<{
		Params: { id: string };
		Querystring: getUsersQuery;
	}>(
		"/:id/friends",
		{
			preHandler: onlySelf, //* Private user route. Only user with ID match (cookieJWT <-> database) can access it
			schema: {
				tags: ["Friends"],
				summary: "Get all friends of a user",
				description:
					"Supports filtering, sorting, and pagination via query params.",
				params: userIdParamSchema,
				querystring: getUsersQuerySchema,
				response: {
					200: userArrayResponseSchema,
					400: errorResponseSchema.describe("Bad request"),
					404: errorResponseSchema.describe("Not Found"),
				},
			},
		},
		appErrorHandler(getFriendsHandler),
	);

	// TODO: Commented out because we're using friend_request instead
	// 10. Add a user friend by ID
	// server.post<{
	// 	Params: { id: string };
	// 	Body: addFriendInput;
	// }>(
	// 	"/:id/friends",
	// 	{
	// 		preHandler: onlySelf, //* Private user route. Only user with ID match (cookieJWT <-> database) can access it
	// 		schema: {
	// 			tags: ["Friends"],
	// 			summary: "Add a friend",
	// 			description:
	// 				"Creates a bidirectional friendship between the current user and the target user.",
	// 			params: userIdParamSchema,
	// 			body: addFriendSchema,
	// 			response: {
	// 				// 201: userArrayResponseSchema,
	// 				201: userResponseSchema,
	// 				400: errorResponseSchema.describe("Bad request"),
	// 				404: errorResponseSchema.describe("Not Found"),
	// 				409: errorResponseSchema.describe("Already friends"),
	// 			},
	// 		},
	// 	},
	// 	appErrorHandler(addFriendHandler),
	// );

	// 11. Delete a user friend by ID and TargetID
	server.delete<{ Params: { id: string; targetUserId: string } }>(
		"/:id/friends/:targetUserId",
		{
			preHandler: onlySelf, //* Private user route. Only user with ID match (cookieJWT <-> database) can access it
			schema: {
				tags: ["Friends"],
				summary: "Delete a friend",
				description:
					"Removes the friendship link between the user and the target user.",
				params: userIdParamSchema.merge(targetUserIdParamSchema),
				response: {
					// 200: userArrayResponseSchema,
					204: emptyResponseSchema,
					400: errorResponseSchema.describe("Bad request"),
					404: errorResponseSchema.describe("Not Found"),
				},
			},
		},
		appErrorHandler(deleteFriendHandler),
	);

	// TODO: Commented out because we're not using these blockFriend
	// 	// 12. Get all blocked users by ID
	// 	server.get<{
	// 		Params: { id: string };
	// 		Querystring: getUsersQuery;
	// 	}>(
	// 		"/:id/block-list",
	// 		{
	// 			preHandler: onlySelf, //* Private user route. Only user with ID match (cookieJWT <-> database) can access it
	// 			schema: {
	// 				tags: ["Block List"],
	// 				summary: "Get all blocked users",
	// 				description:
	// 					"Returns the list of users blocked by this user. Supports filtering, sorting, and pagination via query params.",
	// 				params: userIdParamSchema,
	// 				querystring: getUsersQuerySchema,
	// 				response: {
	// 					200: userArrayResponseSchema,
	// 					400: errorResponseSchema.describe("Bad request"),
	// 					404: errorResponseSchema.describe("Not Found"),
	// 				},
	// 			},
	// 		},
	// 		appErrorHandler(getBlockedUsersHandler),
	// 	);

	// 	// 13. Block a user by ID
	// 	server.post<{
	// 		Params: { id: string };
	// 		Body: blockUserInput;
	// 	}>(
	// 		"/:id/block-list",
	// 		{
	// 			preHandler: onlySelf, //* Private user route. Only user with ID match (cookieJWT <-> database) can access it
	// 			schema: {
	// 				tags: ["Block List"],
	// 				summary: "Block a user",
	// 				description:
	// 					"Adds the target user to the caller's block list (unidirectional).",
	// 				params: userIdParamSchema,
	// 				body: blockUserSchema,
	// 				response: {
	// 					// 201: userArrayResponseSchema,
	// 					201: userResponseSchema,
	// 					400: errorResponseSchema.describe("Bad request"),
	// 					404: errorResponseSchema.describe("Not Found"),
	// 					409: errorResponseSchema.describe("Already blocked"),
	// 				},
	// 			},
	// 		},
	// 		appErrorHandler(blockUserHandler),
	// 	);

	// 	// 14. Unblock a user by ID
	// 	server.delete<{ Params: { id: string; targetUserId: string } }>(
	// 		"/:id/block-list/:targetUserId",
	// 		{
	// 			preHandler: onlySelf, //* Private user route. Only user with ID match (cookieJWT <-> database) can access it
	// 			schema: {
	// 				tags: ["Block List"],
	// 				summary: "Unblock a user",
	// 				description:
	// 					"Removes the target user from the caller's block list (unidirectional).",
	// 				params: userIdParamSchema.merge(targetUserIdParamSchema),
	// 				response: {
	// 					// 200: userArrayResponseSchema,
	// 					204: emptyResponseSchema,
	// 					400: errorResponseSchema.describe("Bad request"),
	// 					404: errorResponseSchema.describe("Not Found"),
	// 				},
	// 			},
	// 		},
	// 		appErrorHandler(unblockUserHandler),
	// 	);
}

export default userRoutes;
