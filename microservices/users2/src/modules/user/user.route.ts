import { FastifyInstance } from "fastify";
import {
	registerUserHandler,
	loginHandler,
	getUsersHandler,
} from "./user.controller";
import {
	createUserSchema,
	userResponseSchema,
	loginSchema,
	loginResponseSchema,
	userArrayResponseSchema,
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
	// This route IS authenticated because it doesn't have "config: { authRequired: false },"
	server.get(
		"/",
		{
			schema: {
				response: {
					200: userArrayResponseSchema,
				},
			},
		},
		errorHandler(getUsersHandler),
	);
}

export default userRoutes;
