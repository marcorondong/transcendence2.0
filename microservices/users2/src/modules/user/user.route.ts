import { FastifyInstance } from "fastify";
import { registerUserHandler, loginHandler, getUsersHandler } from "./user.controller";
import { createUserSchema, createUserResponseSchema, loginSchema, loginResponseSchema, userArrayResponseSchema } from './user.schema';
// import { ZodTypeProvider } from 'fastify-type-provider-zod';  // It seems that this is not used

async function userRoutes(server: FastifyInstance) {
	// MR_NOTE: I should do this if I haven't enabled Zod globally
	// const app = server.withTypeProvider<ZodTypeProvider>();
	// OR: server.withTypeProvider<ZodTypeProvider>().post("/", {...});
	// The function definition is this: server.get(path, options, handler); (3 arguments)
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
	registerUserHandler
	);

	server.post("/login", {
		schema: {
			body: loginSchema,
			response: {
			200: loginResponseSchema,
			},
		},
		config: { authRequired: false },
	}, loginHandler);

	// This route is NOT authenticated
	// server.get("/", {
	// 	schema: {
	// 		response: {
	// 			200: userArrayResponseSchema,
	// 		},
	// 	config: { authRequired: false },
	// 	},
	// },
	// getUsersHandler);
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