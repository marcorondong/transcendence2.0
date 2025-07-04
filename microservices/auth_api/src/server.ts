import Fastify from "fastify";
import {
	// ft_serverOption,
	swaggerOption,
	swaggerUiOption,
	jwtOption,
	cookieOption,
} from "./utils/options";
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
} from "fastify-type-provider-zod";
import { globalErrorHandler } from "./utils/globalErrorHandler";
import fastifySwagger, { SwaggerOptions } from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { authRoutes } from "./routes/routes";
import fCookie from "@fastify/cookie";
import fastifyJWT from "@fastify/jwt";
import { ft_onRequest } from "./utils/onRequest";
import { env } from "./utils/env";

// use "ft_serverOption" instead of "{ logger: true }" to activate pino-pretty
const server = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.setErrorHandler(globalErrorHandler);
server.register(fastifySwagger, swaggerOption as SwaggerOptions);
server.register(fastifySwaggerUi, swaggerUiOption);
server.register(authRoutes);
server.register(fastifyJWT, jwtOption);
server.register(fCookie, cookieOption);
server.addHook("onRequest", ft_onRequest);

declare module "@fastify/jwt" {
	interface FastifyJWT {
		user: {
			id: string;
			nickname: string;
		};
	}
}

const start = async () => {
	try {
		await server.listen({ port: env.AUTH_API_PORT, host: env.HOST });
		console.log(`auth_api is running on port ${env.AUTH_API_PORT}`);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
