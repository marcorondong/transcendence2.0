import { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

async function toolsRoutes(server: FastifyInstance) {
	// This route IS NOT authenticated
	// Swagger + UI route
	server.after(() => {
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
	});
	server.register(fastifySwaggerUI, {
		routePrefix: "/swagger",
		// staticCSP: true,
	});
	// healthcheck route (if server is up and running)
	server.get(
		"/healthcheck",
		{
			config: { authRequired: false },
		},
		async (_, reply) => {
			return reply.code(200).send({ status: "ok" });
		},
	);
}

export default toolsRoutes;
