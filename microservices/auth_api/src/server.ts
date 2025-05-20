import Fastify from "fastify";
import {
	serverOption,
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
import { onRequest } from "./utils/onRequest";
import { env } from "./utils/env";

const server = Fastify(serverOption).withTypeProvider<ZodTypeProvider>();
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.setErrorHandler(globalErrorHandler);
server.register(fastifySwagger, swaggerOption as SwaggerOptions);
server.register(fastifySwaggerUi, swaggerUiOption);
server.register(authRoutes);
server.register(fastifyJWT, jwtOption);
server.register(fCookie, cookieOption);
server.addHook("onRequest", onRequest);

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
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
