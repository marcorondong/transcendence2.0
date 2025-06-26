import { jsonSchemaTransform } from "fastify-type-provider-zod";
import { env } from "./env";
import fs from "fs";

let jwtSecret: string;
export let cookieSecret: string;

try {
	jwtSecret = fs.readFileSync(
		env.AUTH_API_JWT_SECRET_FILE_LOCATION_CONTAINER,
		"utf8",
	);
	cookieSecret = fs.readFileSync(
		env.AUTH_API_COOKIE_SECRET_FILE_LOCATION_CONTAINER,
		"utf8",
	);
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
	routePrefix: env.AUTH_API_DOCUMENTATION_STATIC,
};

// const serverOption = {
// 	logger: {
// 		level: "warn",
// 		transport: {
// 			target: "pino-pretty",
// 			options: {
// 				colorize: true,
// 				ignore: "INFO",
// 				translateTime: "HH:MM:ss Z",
// 			},
// 		},
// 	},
// };

// export function ft_serverOption() {
// 	try {
// 		require.resolve("pino-pretty");
// 		return serverOption;
// 	} catch {
// 		return { logger: true }; // Fallback to default logger if pino-pretty is not available
// 	}
// }

export const jwtOption = {
	secret: jwtSecret,
	cookie: {
		cookieName: env.JWT_TOKEN_NAME,
		signed: true,
	},
	sign: {
		expiresIn: "5h",
	},
};

export const cookieOption = {
	secret: cookieSecret,
	parseOptions: {
		path: "/",
		httpOnly: true,
		secure: true,
		signed: true,
		sameSite: "strict" as const,
		maxAge: 5 * 60 * 60,
	},
};
