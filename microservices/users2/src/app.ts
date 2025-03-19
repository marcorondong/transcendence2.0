// console.log("hello world");
import Fastify, { fastify, FastifyReply, FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { ZodTypeProvider, validatorCompiler, serializerCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';
import userRoutes from "./modules/user/user.route";
// import { request } from "http";  // It seems that this is not used

// Creating server
// const server = Fastify();

// Creating server with global Zod type inference
export const server = Fastify().withTypeProvider<ZodTypeProvider>();

// Set Zod as the validator and serializer compiler
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// Set JWT plugin
// TODO: Maybe this JWT part should be handled by Autentication Service
server.register(fastifyJwt, {
	secret: "supersecret",
});

server.decorate(
	"auth",
	async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			await request.jwtVerify();
		} catch (e) {
			return reply.send(e);
		}
	}
);

// Route for checking health (if server is up and running)
server.get('/healthcheck', async function() {
	return {status: "OK"};
});

async function main() {
	// Register routes
	server.register(userRoutes, {prefix: 'api/users'})
	try{
		// Start server
		await server.listen( {port: 3000, host: "0.0.0.0"});
		console.log('Server ready at http://localhost:3000');
	} catch(e) {
		console.error(e);
		process.exit(1);
	}
}

main()