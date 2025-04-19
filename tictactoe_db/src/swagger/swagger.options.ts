import { jsonSchemaTransform } from "fastify-type-provider-zod";

export const swaggerOptions = {
	exposeRoute: true,
	openapi: {
		info: {
			title: "ft_transcendence API",
			description: "Swagger docs for ft_transcendence project",
			version: "1.0.0",
		},
		// Enable Auth option in Swagger (to reach authenticated routes)
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
		security: [{ bearerAuth: [] }], // Apply Auth option globally to all routes
	},
	transform: jsonSchemaTransform,
};

export const swaggerUiOptions = {
	routePrefix: "/documentation",
};