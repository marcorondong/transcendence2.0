import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
} from "fastify-type-provider-zod";
import userRoutes from "./modules/user/user.route";
import friendRequestRoutes from "./modules/friend_request/friend_request.route";
import productRoutes from "./modules/product/product.route";
import { setupSwagger, toolsRoutes } from "./modules/tools/tools.route";
import { ft_fastifyErrorHandler } from "./utils/errors";
import { fastifyLoggerConfig } from "./utils/logger";

// Creating server with global Zod type inference and logger config
export const server = Fastify({
	logger: fastifyLoggerConfig(),
}).withTypeProvider<ZodTypeProvider>();

// Set Zod as the validator and serializer compiler
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// Register multipart (for picture uploads) and set limits
// TODO: Later move these constraints to Nginx (separation of concerns, unique source of truth)
server.register(multipart, {
	limits: { fileSize: 1_048_576 }, // 1MB in bytes
});
// server.register(multipart); // No config needed. (When Nginx is configured)

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
	server.register(friendRequestRoutes, { prefix: "api/friend-requests" });
	server.register(productRoutes, { prefix: "api/products" });
	// Set global error handler. This uses custom AppError class for well structured errors, fields and more info
	server.setErrorHandler(ft_fastifyErrorHandler);
	try {
		// Start server
		await server.listen({ port: 3000, host: "0.0.0.0" });
		console.log("Server ready at http://localhost:3000");
	} catch (err) {
		console.error(err);
		process.exit(1); // I DO WANT to shut down the server if an error in listen is raised
	}
}

main();
