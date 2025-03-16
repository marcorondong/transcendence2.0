import myFastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { itemRoutes } from './routes/routes';
import cors from '@fastify/cors';
import { swaggerOptions, swaggerUiOptions } from './swagger/swagger';
 

const PORT = 5000;

const fastifyApi: FastifyInstance = myFastify({
    logger: false
});

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

const start_api = async () => {
    try {
        await fastifyApi.listen({port: PORT});
        console.log(`Server listening at ${PORT}`);
    } catch (err) {
        fastifyApi.log.error(err);
        process.exit(1);
    }
};

start_api();

console.log('Hello, world!');