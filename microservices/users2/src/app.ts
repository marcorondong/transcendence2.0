// console.log("hello world");
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
	jsonSchemaTransform,
} from "fastify-type-provider-zod";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import userRoutes from "./modules/user/user.route";
import productRoutes from "./modules/product/product.route";
import toolsRoutes from "./modules/tools/tools.route";
import { AppError } from "./utils/errors";
// import { request } from "http";  // It seems that this is not used

// Creating server with global Zod type inference
export const server = Fastify().withTypeProvider<ZodTypeProvider>();

// Set Zod as the validator and serializer compiler
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// TODO: This should be done in a "types/fastify.d.ts" file
// Extend TypeScript Fastify's types to add "authRequired" custom field. (augmenting)(augmenting Fastify's type system)
declare module "fastify" {
	interface FastifyContextConfig {
		authRequired?: boolean;
	}
}

// Extend TypeScript Fastify's types to add "authenticate" function. (extending public types)(augmenting Fastify's type system)
declare module "fastify" {
	export interface FastifyInstance {
		authenticate: (
			request: FastifyRequest,
			reply: FastifyReply,
		) => Promise<void>;
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

// TODO: Maybe this JWT part should be handled by Authentication Service
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
		} catch (err) {
			return reply.send(err);
		}
	},
);

// Public paths to NOT enforce authentication
const publicPaths = ["/healthcheck", "/docs", "/docs/json"];
// const publicPaths = [
// 	"/api/tools/healthcheck",
// 	"/api/tools/swagger",
// 	"/api/tools/swagger/json",
// ];

// Hook to check route config (authentication required by default)
server.addHook("onRequest", async (request, reply) => {
	const isPublic = publicPaths.some((path) =>
		request.raw.url?.startsWith(path),
	);
	const requiresAuth =
		!isPublic && request.routeOptions?.config?.authRequired !== false;

	if (!requiresAuth) return;
	await server.authenticate(request, reply);
});

// Route for checking health (if server is up and running)
server.get("/healthcheck", async function () {
	return { status: "OK" };
});

async function main() {
	// Register swagger/openAPI plugins
	await server.register(fastifySwagger, {
		openapi: {
			info: {
				title: "ft_transcendence Users API",
				description: "Swagger docs for ft_transcendence project",
				version: "1.0.0",
			},
		},
		transform: jsonSchemaTransform, // Important for Zod compatibility
	});
	// Register routes
	await server.register(fastifySwaggerUI, { routePrefix: "/docs" });
	// await server.register(toolsRoutes, { prefix: "/api/tools" });
	server.register(userRoutes, { prefix: "api/users" });
	server.register(productRoutes, { prefix: "api/products" });
	// Global error handler
	server.setErrorHandler((error, request, reply) => {
		// Custom AppError (e.g., domain-specific errors like "Email exists")
		if (error instanceof AppError) {
			request.log.error({
				code: error.code,
				handler: error.handlerName || "unknown",
				msg: error.message,
				stack: error.stack,
			});
			return reply.code(error.statusCode).send({
				statusCode: error.statusCode,
				code: error.code ?? "UNKNOWN_ERROR",
				error: error.errorType,
				handler: error.handlerName || "unknown",
				message: error.message,
			});
		}
		// Unknown/unexpected error
		request.log.error({
			msg: error.message || "Unhandled exception",
			stack: error.stack,
		});
		return reply.send(error);
	});
	try {
		// Start server
		await server.listen({ port: 3000, host: "0.0.0.0" });
		console.log("Server ready at http://localhost:3000");
	} catch (err) {
		console.error(err);
		// process.exit(1); // I don't want to shut down the server if an error is raised
	}
}

main();
