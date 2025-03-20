// console.log("hello world");
import Fastify, { fastify, FastifyReply, FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { ZodTypeProvider, validatorCompiler, serializerCompiler, jsonSchemaTransform } from "fastify-type-provider-zod";
import userRoutes from "./modules/user/user.route";
import productRoutes from "./modules/product/product.route";
// import { request } from "http";  // It seems that this is not used

// Creating server
// const server = Fastify();

// Creating server with global Zod type inference
export const server = Fastify().withTypeProvider<ZodTypeProvider>();

// Set Zod as the validator and serializer compiler
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// TODO: This should be done in a "types/fastify.d.ts" file
// TODO: Reseaarch if "?" is for making it optional.
// Extend TypeScript Fastify's types to add "authRequired" custom field. (augmenting)(augmenting Fastify's type system)
declare module 'fastify' {
	interface FastifyContextConfig {
	  authRequired?: boolean;
	}
  }

// Extend TypeScript Fastify's types to add "authenticate" function. (extending public types)(augmenting Fastify's type system)
declare module 'fastify' {
	export interface FastifyInstance {
	  authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}
  }

// TODO: register this differently. e.g., src/types/jwt.d.ts or in app.ts before initializing Fastify
// Extend FastifyJWT module to recognize "user" (fields in JWT). (module augmentation)(augmenting Fastify's type system)
declare module "@fastify/jwt" {
	interface FastifyJWT {
		user: {
			id: number;
			email: string;
			name: string;
		};
	}
}

// TODO: Maybe this JWT part should be handled by Autentication Service
// Set JWT plugin
server.register(fastifyJwt, {
	secret: "supersecret",
});

// Add JWT Authentication Middleware
server.decorate(
	"authenticate", // This is a custom function on Fastify
	async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			await request.jwtVerify();
		} catch (e) {
			return reply.send(e);
		}
	}
);

// Hook to check route config (authentication required by default)
server.addHook("onRequest", async (request, reply) => {
	const requiresAuth = request.routeOptions?.config?.authRequired !== false;
	if (!requiresAuth) return;  // Skip auth
	await server.authenticate(request, reply);  // Enforce auth
  });

// Route for checking health (if server is up and running)
server.get('/healthcheck', async function() {
	return {status: "OK"};
});

async function main() {
	// Register routes
	server.register(userRoutes, {prefix: 'api/users'});
	server.register(productRoutes, {prefix: 'api/products'});
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