import { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

export async function setupSwagger(server: FastifyInstance) {
	// Remove authentication from Swagger-related routes
	server.addHook("onRoute", (routeOptions) => {
		if (
			routeOptions.url.startsWith("/api/documentation") ||
			routeOptions.url === "/api/documentation/json"
		) {
			routeOptions.config = {
				...(routeOptions.config ?? {}),
				authRequired: false,
			};
		}
	});
	// Register Swagger + Swagger UI
	server.register(fastifySwagger, {
		openapi: {
			info: {
				title: "ft_transcendence API",
				description: "Swagger docs for ft_transcendence project",
				version: "1.0.0",
			},
		},
		transform: jsonSchemaTransform,
	});

	server.register(fastifySwaggerUI, {
		routePrefix: "/api/documentation",
	});
}

async function toolsRoutes(server: FastifyInstance) {
	server.get(
		"/healthcheck",
		// Remove authentication (this route is public)
		{ config: { authRequired: false } },
		async (_, reply) => reply.code(200).send({ status: "ok" }),
	);
}

export default toolsRoutes;
