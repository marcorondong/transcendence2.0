import { jsonSchemaTransform } from "fastify-type-provider-zod";
import { env } from "./env";

export const swaggerOption = {
	exposeRoute: true,
	openapi: {
		info: {
			title: "ft_transcendence pong_db API",
			description: "Swagger docs for pong_db",
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

export const swaggerUiOption = {
	routePrefix: env.PONG_DB_DOCUMENTATION_STATIC,
};

export const serverOption = {
	logger: {
		level: "warn",
		transport: {
			target: "pino-pretty",
			options: {
				colorize: true,
				ignore: "INFO",
				translateTime: "HH:MM:ss Z",
			},
		},
	},
};
