import { jsonSchemaTransform } from "fastify-type-provider-zod";
import fs from 'fs';

let jwtSecret: string;
let cookieSecret: string;

try {
	const jwtSecretFile = process.env.JWT_SECRET_FILE || "/run/secrets/jwtSecret.key";
	const cookieSecretFile = process.env.COOKIE_SECRET_FILE || "/run/secrets/cookieSecret.key";
	jwtSecret = fs.readFileSync(jwtSecretFile, "utf8");
	cookieSecret = fs.readFileSync(cookieSecretFile, "utf8");
} catch (error) {
	console.error("Error reading secret files:", error);
	process.exit(1);
}

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
	secret: jwtSecret,
	cookie: {
		cookieName: 'access_token',
		signed: true,
	},
}

export const cookieOption = {
	secret: cookieSecret, // TODO COOKIE_SECRET over docker secrets
	parseOptions: {
		signed: true,
	},
}