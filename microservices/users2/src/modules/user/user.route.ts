import { FastifyInstance } from "fastify";
import { registerUserHandler } from "./user.controller";

// import { createUserSchema, createUserResponseSchema } from "./user.schema";
// import { ZodTypeProvider } from "fastify-type-provider-zod";

// async function userRoutes(server:FastifyInstance) {
// 	server.withTypeProvider().post("/", {
// 		schema: {
// 			body: createUserSchema,
// 			response: {
// 				201: createUserResponseSchema,
// 			},
// 		}
// 	}, registerUserHandler);
// }

// import { ZodTypeProvider } from 'fastify-type-provider-zod';  // It seems that this is not used
import { createUserSchema, createUserResponseSchema } from './user.schema';

// =================================================================
// server.withTypeProvider<ZodTypeProvider>().post("/", {...});
// =================================================================

// =================================================================
// async function userRoutes(server: FastifyInstance) {
// 	const app = server.withTypeProvider<ZodTypeProvider>();
  
// 	app.post(
// 		'/',
// 		{
// 		schema: {
// 			body: createUserSchema,
// 			response: {
// 			201: createUserResponseSchema,
// 			},
// 		},
// 	},
// 	registerUserHandler
// 	);
// }
// =================================================================

async function userRoutes(server: FastifyInstance) {

	// MR_NOTE: I should do this if I haven't enabled Zod globally
	// const app = server.withTypeProvider<ZodTypeProvider>();
	// server.withTypeProvider<ZodTypeProvider>().post("/", {...});
  
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
}

// async function userRoutes(server:FastifyInstance) {
// 	server.post("/", registerUserHandler);
// }

export default userRoutes