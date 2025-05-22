import Fastify from "fastify";
import { serverOption, swaggerOption, swaggerUiOption } from "./utils/options";
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler,
} from "fastify-type-provider-zod";
import { globalErrorHandler } from "./utils/globalErrorHandler";
import fastifySwagger, { SwaggerOptions } from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { chatRoutes } from "./routes/routes";
import { env } from "./utils/env";

const server = Fastify(serverOption).withTypeProvider<ZodTypeProvider>();
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.setErrorHandler(globalErrorHandler);
server.register(fastifySwagger, swaggerOption as SwaggerOptions);
server.register(fastifySwaggerUi, swaggerUiOption);
server.register(chatRoutes);

const start = async () => {
	try {
		await server.listen({ port: env.CHAT_DB_PORT, host: env.HOST });
		console.log(`chat_db is running on port ${env.CHAT_DB_PORT}`);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
