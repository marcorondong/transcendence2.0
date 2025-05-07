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
	secret: 'jwt_secret_key', // process.env.JWT_SECRET' // or JWT_SECRET over docker secrets
	cookie: {
		cookieName: 'access_token', // Name of the cookie to be used
		signed: true, // Ensures the cookie is signed
	},
}

export const cookieOption = {
	secret: "cookie_secret_key", // process.env.COOKIE_SECRET,  // adds additional layer of protection. Prevents modify its contents and ensuring the integrity of the cookie’s data. However, adds a bit of overhead
	parseOptions: {
		signed: true, // Ensures the cookie is signed
	},
}