import myFastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { itemRoutes } from './routes/routes';
 

const PORT = 5000;

const fastifyApi: FastifyInstance = myFastify({
    logger: true
});

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