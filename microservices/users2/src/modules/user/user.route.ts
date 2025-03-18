import { FastifyInstance } from "fastify";
import { registerUserHandler } from "./user.controller";
import { createUserSchema, createUserResponseSchema } from './user.schema';
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
}

export default userRoutes