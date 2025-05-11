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

// TODO: Add explanation to routes and that authentication is enabled by default?

async function userRoutes(server: FastifyInstance) {
	// 1. Create a new user
	server.post(
		"/",
		{
			schema: {
				body: createUserSchema,
				response: {
					201: userResponseSchema,
				},
				security: [], // Remove Swagger auth
			},
			// TODO: This route is public. But commenting out since AUTH is doing the authentication check
			// config: { authRequired: false }, // Remove authentication (this route is public)
		},
		errorHandler(registerUserHandler),
	);
	// 2. Log in to get authorization token (to access private/authenticated routes)
	server.post(
		"/login",
		{
			schema: {
				body: loginSchema,
				response: {
					200: loginResponseSchema,
				},
				security: [], // Remove Swagger auth
			},
			// TODO: This route is public. But commenting out since AUTH is doing the authentication check
			// config: { authRequired: false }, // Remove authentication (this route is public)
		},
		errorHandler(loginHandler),
	);
	// 3. Get a single user by ID
	// This route IS authenticated (doesn't have "config: { authRequired: false },")
	server.get(
		"/:id",
		{
			schema: {
				params: userIdParamSchema,
				response: {
					200: userResponseSchema,
				},
			},
		},
		errorHandler(getUserHandler),
	);
	// 4. Get all users (with filters/sorting/ordering/pagination)
	// This route IS authenticated (doesn't have "config: { authRequired: false },")
	server.get(
		"/",
		{
			schema: {
				querystring: getUsersQuerySchema,
				response: {
					200: userArrayResponseSchema,
				},
			},
		},
		errorHandler(getUsersHandler),
	);
	// 5. Update ALL user fields (PUT)
	// This route IS authenticated (doesn't have "config: { authRequired: false },")
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
		},
		errorHandler(putUserHandler),
	);
	// 6. Update SOME user fields (PATCH)
	// This route IS authenticated (doesn't have "config: { authRequired: false },")
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
		},
		errorHandler(patchUserHandler),
	);
	// 7. Delete a user by ID
	// This route IS authenticated (doesn't have "config: { authRequired: false },")
	server.delete(
		"/:id",
		{
			schema: {
				params: userIdParamSchema,
			},
		},
		errorHandler(deleteUserHandler),
	);
}

export default userRoutes;
