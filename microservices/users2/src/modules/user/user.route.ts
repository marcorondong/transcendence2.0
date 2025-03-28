import { FastifyInstance } from "fastify";
import { registerUserHandler, loginHandler, getUsersHandler } from "./user.controller";
import { createUserSchema, createUserResponseSchema, loginSchema, loginResponseSchema, userArrayResponseSchema } from './user.schema';

async function userRoutes(server: FastifyInstance) {
	// MR_NOTE: I should do this if I haven't enabled Zod globally
	// const app = server.withTypeProvider<ZodTypeProvider>();
	// OR: server.withTypeProvider<ZodTypeProvider>().post("/", {...});
	// The function definition is this: server.get(path, options, handler); (3 arguments)
	// Expected response structure and status code for Fastify to validate responses (against Zod schemas).
	// to validate response structure matches schema (e.g., Fastify/Zod enforcement).
	// This route IS NOT authenticated
	server.post("/",
		{
		schema: {
			body: createUserSchema,
			response: {
				201: createUserResponseSchema,
			},
		},
		config: { authRequired: false },
	},
	registerUserHandler);

	// This route IS NOT authenticated
	server.post("/login", {
		schema: {
			body: loginSchema,
			response: {
				200: loginResponseSchema,
			},
		},
		config: { authRequired: false },
	},
	loginHandler);

	// This route IS authenticated because it doesnt have "config: { authRequired: false },"
	server.get("/", {
		schema: {
			response: {
				200: userArrayResponseSchema,
			},
		},
	},
	getUsersHandler);
}

export default userRoutes