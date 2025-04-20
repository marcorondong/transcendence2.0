import { jsonSchemaTransform } from "fastify-type-provider-zod";

export const swaggerOptions = {
	exposeRoute: true,
	openapi: {
		info: {
			title: "ft_transcendence API",
			description: "Swagger docs for chat_db",
			version: "1.0.0",
		},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
		security: [{ bearerAuth: [] }],
	},
	transform: jsonSchemaTransform,
};

export const swaggerUiOptions = {
	routePrefix: "/documentation",
};