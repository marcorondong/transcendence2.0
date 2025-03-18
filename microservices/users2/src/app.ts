// console.log("hello world");
import Fastify from "fastify";
import { ZodTypeProvider, validatorCompiler, serializerCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';
import userRoutes from "./modules/user/user.route";

// Creating server
// const server = Fastify();

// Creating server with global Zod type inference
const server = Fastify().withTypeProvider<ZodTypeProvider>();

// Set Zod as the validator and serializer compiler
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

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