import { FastifyInstance } from "fastify";
import {
	registerUserHandler,
	loginHandler,
	getUsersHandler,
	getUserHandler,
	putUserHandler,
	patchUserHandler,
	deleteUserHandler,
} from "./user.controller";
import {
	createUserSchema, // TODO: Rename this to postUserSchema?
	userResponseSchema,
	loginSchema,
	loginResponseSchema,
	userArrayResponseSchema,
	userIdParamSchema,
	getUsersQuerySchema, // TODO: Rename this to userQuerySchema
	putUserSchema,
	patchUserSchema,
} from "./user.schema";
import { errorHandler } from "../../utils/errors";

// MR_NOTE:
// The functions definition is this: server.get(path, options, handler); (3 arguments)
// Expected response structure and status code for Fastify to validate responses (against Zod schemas).
// To validate request/response structure must match schema (Fastify/Zod enforcement).

async function userRoutes(server: FastifyInstance) {
	server.post(
		"/",
		{
			schema: {
				body: createUserSchema,
				response: {
					201: userResponseSchema,
				},
			},
			// Remove authentication (this route is public)
			config: { authRequired: false },
		},
		errorHandler(registerUserHandler),
	);
	server.post(
		"/login",
		{
			schema: {
				body: loginSchema,
				response: {
					200: loginResponseSchema,
				},
			},
			// Remove authentication (this route is public)
			config: { authRequired: false },
		},
		errorHandler(loginHandler),
	);
	// // This route IS authenticated because it doesn't have "config: { authRequired: false },"
	// server.get(
	// 	"/",
	// 	{
	// 		schema: {
	// 			response: {
	// 				200: userArrayResponseSchema,
	// 			},
	// 		},
	// 	},
	// 	errorHandler(getUsersHandler),
	// );
	// 1. Get a single user by ID
	// This route IS authenticated because it doesn't have "config: { authRequired: false },"
	server.get(
		"/:id",
		{
			schema: {
				params: userIdParamSchema,
				response: {
					200: userResponseSchema,
				},
			},
			config: { authRequired: false }, // TODO: Remove this
		},
		errorHandler(getUserHandler),
	);
	// 2. Get all users (with filters/sorting/pagination)
	// This route IS authenticated because it doesn't have "config: { authRequired: false },"
	server.get(
		"/",
		{
			schema: {
				querystring: getUsersQuerySchema,
				response: {
					200: userArrayResponseSchema,
				},
			},
			config: { authRequired: false }, // TODO: Remove this
		},
		errorHandler(getUsersHandler),
	);
	// 3. Update all user fields (PUT)
	// This route IS authenticated because it doesn't have "config: { authRequired: false },"
	server.put(
		"/:id",
		{
			schema: {
				params: userIdParamSchema,
				body: putUserSchema,
				response: {
					200: userResponseSchema,
				},
			},
			config: { authRequired: false }, // TODO: Remove this
		},
		errorHandler(putUserHandler),
	);
	// 4. Update some user fields (PATCH)
	// This route IS authenticated because it doesn't have "config: { authRequired: false },"
	server.patch(
		"/:id",
		{
			schema: {
				params: userIdParamSchema,
				body: patchUserSchema,
				response: {
					200: userResponseSchema,
				},
			},
			config: { authRequired: false }, // TODO: Remove this
		},
		errorHandler(patchUserHandler),
	);
	// 5. Delete a user by ID
	// This route IS authenticated because it doesn't have "config: { authRequired: false },"
	server.delete(
		"/:id",
		{
			schema: {
				params: userIdParamSchema,
			},
			config: { authRequired: false }, // TODO: Remove this
		},
		errorHandler(deleteUserHandler),
	);
}

export default userRoutes;
