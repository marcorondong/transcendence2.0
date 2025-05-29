import { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { jsonSchemaTransform } from "fastify-type-provider-zod";
import { SwaggerOptions } from "@fastify/swagger";
import { getConfig } from "../../utils/config";

export async function setupSwagger(server: FastifyInstance) {
	const { APP_VERSION, APP_NAME, APP_DESCRIPTION, NODE_ENV } = getConfig();
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
		},
		transform: jsonSchemaTransform,
	} as SwaggerOptions);

	server.register(fastifySwaggerUI, {
		routePrefix: "/api/documentation",
	});
}

export async function toolsRoutes(server: FastifyInstance) {
	server.get("/health-check", async (_, reply) =>
		reply.code(200).send({ status: "ok" }),
	);
}
