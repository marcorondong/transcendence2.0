import Fastify from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import { serverOption, swaggerOption, swaggerUiOption, jwtOption, cookieOption } from "./utils/options";
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
} from "fastify-type-provider-zod";
import { globalErrorHandler } from "./utils/globalErrorHandler";
import fastifySwagger, { SwaggerOptions } from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { authRoutes } from "./routes/routes";

import fCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';
import type { JWT } from '@fastify/jwt';
import path from "path"; // TODO remove this after frontend is built
import fastifyStatic from "@fastify/static"; // TODO remove this after frontend is built
import { onRequest } from "./utils/onRequest";

const PORT = parseInt(process.env.PORT || "2999", 10);
const HOST = process.env.HOST || "0.0.0.0";

const server = Fastify(serverOption).withTypeProvider<ZodTypeProvider>();
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.setErrorHandler(globalErrorHandler);
server.register(fastifySwagger, swaggerOption as SwaggerOptions);
server.register(fastifySwaggerUi, swaggerUiOption);
server.register(authRoutes, { prefix: "/auth-api" });
server.register(fastifyJWT, jwtOption);
server.register(fCookie, cookieOption);
server.addHook("onRequest", onRequest);
// TODO remove this after frontend is built
server.register(fastifyStatic, {
	root: path.join(__dirname, "../public"),
	prefix: "/",
});
// TODO remove this after frontend is built
server.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
	return reply.sendFile("auth.html");
});

declare module '@fastify/jwt' {
	interface FastifyJWT {
		user: {
			name: string;
			id: string;
			email: string;
		};
	}
}

const start = async () => {
	try {
		await server.listen({ port: PORT, host: HOST });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();