import { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { jsonSchemaTransform } from "fastify-type-provider-zod";
import { SwaggerOptions } from "@fastify/swagger";

export async function setupSwagger(server: FastifyInstance) {
	// TODO: This set-up is for Authenticated routes. But commenting out since AUTH is doing the authentication check
	// // Remove authentication from Swagger-related routes
	// server.addHook("onRoute", (routeOptions) => {
	// 	if (
	// 		routeOptions.url.startsWith("/api/documentation") ||
	// 		routeOptions.url === "/api/documentation/json"
	// 	) {
	// 		routeOptions.config = {
	// 			...(routeOptions.config ?? {}),
	// 			authRequired: false,
	// 		};
	// 	}
	// });
	// Register Swagger + Swagger UI
	server.register(fastifySwagger, {
		exposeRoute: true,
		openapi: {
			info: {
				title: "ft_transcendence API",
				description: "Swagger docs for ft_transcendence project",
				version: "1.0.0",
			},
			// TODO: This set-up is for Authenticated routes. But commenting out since AUTH is doing the authentication check
			// // Enable Auth option in Swagger (to reach authenticated routes)
			// components: {
			// 	securitySchemes: {
			// 		bearerAuth: {
			// 			type: "http",
			// 			scheme: "bearer",
			// 			bearerFormat: "JWT",
			// 		},
			// 	},
			// },
			// security: [{ bearerAuth: [] }], // Apply Auth option globally to all routes
		},
		transform: jsonSchemaTransform,
	} as SwaggerOptions);

	server.register(fastifySwaggerUI, {
		routePrefix: "/api/documentation",
	});
}

async function toolsRoutes(server: FastifyInstance) {
	server.get(
		"/health-check",
		// TODO: This route is public. But commenting out since AUTH is doing the authentication check
		// { config: { authRequired: false } }, // Remove authentication (this route is public)
		async (_, reply) => reply.code(200).send({ status: "ok" }),
	);
}

export default toolsRoutes;
