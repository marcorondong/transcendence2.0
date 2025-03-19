import myFastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { itemRoutes } from './routes/routes';
import cors from '@fastify/cors';
import { swaggerOptions, swaggerUiOptions } from './swagger/swagger';
import fjwt, { FastifyJWT } from '@fastify/jwt'
import fCookie from '@fastify/cookie'
import { userSchemas } from './userSchemas/userSchemas'
import { JWT } from '@fastify/jwt'
 

const PORT = 5000;
const HOST = '0.0.0.0';

const fastifyApi: FastifyInstance = myFastify({
    logger: false
});

for (let schema of [...userSchemas]) {
	fastifyApi.addSchema(schema)
  }

fastifyApi.register(fjwt, { secret: 'this_is_password_should_be_passed_with_docker_secret' })

fastifyApi.decorate(
	'authenticate',
	async (req: FastifyRequest, reply: FastifyReply) => {
	  const token = req.cookies.access_token
	  if (!token) {
		return reply.status(401).send({ message: 'Authentication required' })
	  }
	  // here decoded will be a different type by default but we want it to be of user-payload type
	  const decoded = req.jwt.verify<FastifyJWT['user']>(token)
	  req.user = decoded
	},
  )

  fastifyApi.addHook('preHandler', (req, res, next) => {
	// here we are
	req.jwt = fastifyApi.jwt
	return next()
  })
  // cookies
  fastifyApi.register(fCookie, {
	secret: 'some-secret-key',
	hook: 'preHandler',
  })
  

// Allow all origins (adjust for security)
fastifyApi.register(cors, {
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

fastifyApi.register(fastifySwagger, swaggerOptions);

fastifyApi.register(fastifySwaggerUi, swaggerUiOptions);

fastifyApi.register(itemRoutes);

fastifyApi.get('/', async (request, reply) => {
    return { hello: 'world' };
});

declare module 'fastify' {
	interface FastifyRequest {
		jwt: JWT
	}
	export interface FastifyInstance {
		authenticate: any
	}
	}
	type UserPayload = {
	id: string
	email: string
	name: string
	}
declare module '@fastify/jwt' {
interface FastifyJWT {
	user: UserPayload
}
}

const start_api = async () => {
    try {
        await fastifyApi.listen({port: PORT, host: HOST});
        console.log(`Server listening at ${PORT}`);
    } catch (err) {
        fastifyApi.log.error(err);
        process.exit(1);
    }
};

start_api();

console.log('Hello, world!');