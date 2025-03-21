import { FastifyInstance } from 'fastify';
import { registerUserHandler, loginHandler } from './user.controller';
import { createUserSchema, createUserResponseSchema, loginSchema, loginResponseSchema } from './user.schema';


async function userRoutes(fastifyUser: FastifyInstance) {

	fastifyUser.post(
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

	fastifyUser.post('/login', 
		{
			schema: {
				body: loginSchema,
				response: {
					200: loginResponseSchema
				}
			}
		}, 
		loginHandler
	);

	fastifyUser.get('/hello', async (request, reply) => {
		return { "Hello World": "Hello World" };
	  });
}

export default userRoutes;