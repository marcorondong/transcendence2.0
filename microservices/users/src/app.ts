import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
} from "fastify-type-provider-zod";
import userRoutes from "./modules/user/user.route";
import productRoutes from "./modules/product/product.route";
import { setupSwagger, toolsRoutes } from "./modules/tools/tools.route";
import { AppError } from "./utils/errors";

// Creating server with global Zod type inference
export const server = Fastify().withTypeProvider<ZodTypeProvider>();

// Set Zod as the validator and serializer compiler
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// MR_NOTE: Code snippet example for checking path ONLY when in DEVELOPMENT mode
// const publicPaths: string[] =
// 	process.env.NODE_ENV !== "production"
// 		? ["/api/dev/test", "/api/debug/info"]
// 		: [];

async function main() {
	// Register swagger/openAPI plugins
	await setupSwagger(server);
	// Register routes
	await server.register(toolsRoutes, { prefix: "/api" });
	server.register(userRoutes, { prefix: "api/users" });
	server.register(productRoutes, { prefix: "api/products" });
	// Global error handler
	server.setErrorHandler((error, request, reply) => {
		// Custom AppError (E.g., domain-specific errors like "Email exists")
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
