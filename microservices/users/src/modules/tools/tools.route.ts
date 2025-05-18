import { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { jsonSchemaTransform } from "fastify-type-provider-zod";
import { SwaggerOptions } from "@fastify/swagger";
import { getConfig } from "../../utils/config";

export async function setupSwagger(server: FastifyInstance) {
	const { APP_VERSION, APP_NAME, APP_DESCRIPTION, NODE_ENV } = getConfig();
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
				title:
					NODE_ENV === "production"
						? `${APP_NAME} - Users API`
						: `${APP_NAME} - Users API (Dev)`,
				description:
					NODE_ENV === "production"
						? APP_DESCRIPTION
						: `⚠️ Dev Mode: ${APP_DESCRIPTION}`,
				version: APP_VERSION,
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
