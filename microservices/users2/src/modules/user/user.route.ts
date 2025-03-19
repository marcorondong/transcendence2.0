import { FastifyInstance } from "fastify";
import { registerUserHandler, loginHandler, getUsersHandler } from "./user.controller";
import { createUserSchema, createUserResponseSchema, loginSchema, loginResponseSchema } from './user.schema';
// import { ZodTypeProvider } from 'fastify-type-provider-zod';  // It seems that this is not used

async function userRoutes(server: FastifyInstance) {
	// MR_NOTE: I should do this if I haven't enabled Zod globally
	// const app = server.withTypeProvider<ZodTypeProvider>();
	// OR: server.withTypeProvider<ZodTypeProvider>().post("/", {...});
	server.post(
		"/",
		{
		schema: {
			body: createUserSchema,
			response: {
			201: createUserResponseSchema,
			},
		},
	},
	registerUserHandler
	);

	server.post("/login", {
		schema: {
			body: loginSchema,
			response: {
			200: loginResponseSchema,
			},
		},
	}, loginHandler);

	server.get("/", getUsersHandler)
}

export default userRoutes