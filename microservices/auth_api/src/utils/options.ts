import { jsonSchemaTransform } from "fastify-type-provider-zod";

export const swaggerOption = {
	exposeRoute: true,
	openapi: {
		info: {
			title: "ft_transcendence auth API",
			description: "Swagger docs for auth_api",
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
	routePrefix: "/auth-api/documentation",
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

export const jwtOption = {
	secret: 'jwt_secret_key', // TODO JWT_SECRET over docker secrets
	cookie: {
		cookieName: 'access_token', // TODO JWT_COOKIE_NAME over environment variable
		signed: true,
	},
}

export const cookieOption = {
	secret: "cookie_secret_key", // TODO COOKIE_SECRET over docker secrets
	parseOptions: {
		signed: true,
	},
}