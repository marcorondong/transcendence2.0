import { FastifyInstance } from "fastify";
import { registerUserHandler, loginHandler, getUsersHandler } from "./user.controller";
import { createUserSchema, createUserResponseSchema, loginSchema, loginResponseSchema, userArrayResponseSchema } from './user.schema';
// import { ZodTypeProvider } from 'fastify-type-provider-zod';  // It seems that this is not used


// MR_Note: Old function which didnt use automatic Zod for validation/serialization.
// async function userRoutes(server: FastifyInstance) {
// 	// MR_NOTE: I should do this if I haven't enabled Zod globally
// 	// const app = server.withTypeProvider<ZodTypeProvider>();
// 	// OR: server.withTypeProvider<ZodTypeProvider>().post("/", {...});
// 	// The function definition is this: server.get(path, options, handler); (3 arguments)
// 	server.post("/",
// 		{
// 		schema: {
// 			body: createUserSchema,
// 			response: {
// 			201: createUserResponseSchema,
// 			},
// 		},
// 		config: { authRequired: false },
// 	},
// 	registerUserHandler
// 	);

// 	server.post("/login", {
// 		schema: {
// 			body: loginSchema,
// 			response: {
// 			200: loginResponseSchema,
// 			},
// 		},
// 		config: { authRequired: false },
// 	}, loginHandler);

// 	// This route is NOT authenticated
// 	// server.get("/", {
// 	// 	schema: {
// 	// 		response: {
// 	// 			200: userArrayResponseSchema,
// 	// 		},
// 	// 	config: { authRequired: false },
// 	// 	},
// 	// },
// 	// getUsersHandler);

// 	// This route IS authenticated because it doesnt have "config: { authRequired: false },"
// 	server.get("/", {
// 		schema: {
// 			response: {
// 				200: userArrayResponseSchema,
// 			},
// 		},
// 	},
// 	getUsersHandler);
// }

async function userRoutes(server: FastifyInstance) {
	// MR_NOTE: I should do this if I haven't enabled Zod globally
	// const app = server.withTypeProvider<ZodTypeProvider>();
	// OR: server.withTypeProvider<ZodTypeProvider>().post("/", {...});
	// This route IS NOT authenticated
	// The function definition is this: server.get(path, options, handler); (3 arguments)
	// Expected response structure and status code for Fastify to validate responses (against Zod schemas).
	// to validate response structure matches schema (e.g., Fastify/Zod enforcement).
	server.post("/",
		{
		schema: {
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